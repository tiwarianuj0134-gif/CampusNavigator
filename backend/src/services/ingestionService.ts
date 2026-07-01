/**
 * Ingestion Service
 * Orchestrates scraping, normalization, and persistence.
 * Handles the pipeline: Raw → Staging → Moderation → College
 */

import { College } from '../models/College.js';
import { RawInstitution, IRawInstitution } from '../models/RawInstitution.js';
import { PlacementRecord } from '../models/PlacementRecord.js';
import { IngestionLog } from '../models/IngestionLog.js';
import { PlacementPdfParser, ParsedPlacement } from '../parsers/PlacementPdfParser.js';
import { normalizeInstitutionName, normalizeCity, normalizeState } from '../utils/normalizers/index.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import slugify from 'slugify';

export const ingestionService = {
  // ─── Moderation Queue ───────────────────────────────────────

  /** Get pending items for admin moderation */
  async getModerationQueue(
    source?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const filter: any = { moderationStatus: 'pending' };
    if (source) filter.source = source;

    const [items, total] = await Promise.all([
      RawInstitution.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      RawInstitution.countDocuments(filter),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /** Approve a raw institution → create/update College */
  async approveInstitution(rawId: string, adminId: string, overrides?: Partial<any>) {
    const raw = await RawInstitution.findById(rawId);
    if (!raw) throw new AppError('Raw institution not found', 404);
    if (raw.moderationStatus !== 'pending') {
      throw new AppError('This item has already been moderated', 400);
    }

    // Check if college already exists (by normalized name)
    const nameNorm = normalizeInstitutionName(raw.name);
    let college = await College.findOne({
      $or: [
        { slug: slugify(raw.name, { lower: true, strict: true }) },
        // fuzzy match on name
      ],
    });

    if (college) {
      // Merge data into existing college
      const updates: any = {};

      if (raw.aicteApproved) updates['approvals.aicte'] = true;
      if (raw.aicteId) updates['approvals.aicteId'] = raw.aicteId;
      if (raw.ugcApproved) updates['approvals.ugc'] = true;
      if (raw.naacGrade) {
        updates['approvals.naac'] = {
          grade: raw.naacGrade,
          score: raw.naacScore,
        };
      }
      if (raw.nirfRank) {
        updates['approvals.nirf'] = {
          rank: raw.nirfRank,
          year: raw.nirfYear,
          category: raw.nirfCategory,
        };
      }
      if (raw.website && !college.contact?.website) {
        updates['contact.website'] = raw.website;
      }

      if (overrides) Object.assign(updates, overrides);

      await College.updateOne({ _id: college._id }, { $set: updates });

      // Mark raw as merged
      await RawInstitution.updateOne(
        { _id: rawId },
        {
          $set: {
            moderationStatus: 'merged',
            moderatedBy: adminId,
            moderatedAt: new Date(),
            linkedCollegeId: college._id,
          },
        }
      );

      return { action: 'merged', collegeId: college._id };
    } else {
      // Create new College from raw data
      const newCollege = await College.create({
        name: raw.name.trim(),
        slug: slugify(raw.name, { lower: true, strict: true }),
        description: raw.description || `${raw.name} is an educational institution located in ${raw.city || raw.state || 'India'}.`,
        type: raw.type || 'Private',
        established: raw.established || 0,
        address: {
          city: normalizeCity(raw.city || ''),
          state: normalizeState(raw.state || ''),
          pincode: raw.pincode || '',
          country: 'India',
        },
        approvals: {
          aicte: raw.aicteApproved || false,
          ugc: raw.ugcApproved || false,
          naac: raw.naacGrade ? { grade: raw.naacGrade, score: raw.naacScore } : undefined,
          nirf: raw.nirfRank ? { rank: raw.nirfRank, year: raw.nirfYear, category: raw.nirfCategory } : undefined,
          other: [],
        },
        streams: raw.streams || [],
        contact: {
          website: raw.website || '',
          email: raw.email ? [raw.email] : [],
          phone: raw.phone ? [raw.phone] : [],
        },
        status: 'active',
        tags: [],
        rating: 0,
        reviewCount: 0,
        ...overrides,
      });

      // Mark raw as approved
      await RawInstitution.updateOne(
        { _id: rawId },
        {
          $set: {
            moderationStatus: 'approved',
            moderatedBy: adminId,
            moderatedAt: new Date(),
            linkedCollegeId: newCollege._id,
          },
        }
      );

      return { action: 'created', collegeId: newCollege._id };
    }
  },

  /** Reject a raw institution */
  async rejectInstitution(rawId: string, adminId: string, note?: string) {
    const raw = await RawInstitution.findById(rawId);
    if (!raw) throw new AppError('Raw institution not found', 404);

    await RawInstitution.updateOne(
      { _id: rawId },
      {
        $set: {
          moderationStatus: 'rejected',
          moderatedBy: adminId,
          moderatedAt: new Date(),
          moderationNote: note || '',
        },
      }
    );

    return { action: 'rejected' };
  },

  /** Bulk approve multiple items */
  async bulkApprove(rawIds: string[], adminId: string) {
    const results = [];
    for (const id of rawIds) {
      try {
        const result = await this.approveInstitution(id, adminId);
        results.push({ id, ...result });
      } catch (err: any) {
        results.push({ id, action: 'error', error: err.message });
      }
    }
    return results;
  },

  // ─── Placement Ingestion ────────────────────────────────────

  /** Ingest placement data from parsed PDF */
  async ingestPlacement(
    collegeId: string,
    data: ParsedPlacement,
    source: string,
    adminId?: string
  ) {
    // Validate college exists
    const college = await College.findById(collegeId);
    if (!college) throw new AppError('College not found', 404);

    // Upsert placement record
    const filter = {
      college: collegeId,
      academicYear: data.academicYear,
    };

    const record = {
      college: collegeId,
      academicYear: data.academicYear,
      stats: data.stats,
      branchWise: data.branchWise,
      recruiters: data.recruiters.map(r => ({
        company: r.company,
        offers: r.offers,
        package: r.package,
      })),
      internships: data.internships,
      source,
      isVerified: !!adminId,
      verifiedAt: adminId ? new Date() : undefined,
      verifiedBy: adminId,
    };

    await PlacementRecord.updateOne(filter, { $set: record }, { upsert: true });

    // Also update the college's placement summary
    if (data.stats.averagePackage > 0 || data.stats.highestPackage > 0) {
      await College.updateOne(
        { _id: collegeId },
        {
          $set: {
            'placements.enabled': true,
            'placements.averagePackage': data.stats.averagePackage || college.placements?.averagePackage,
            'placements.highestPackage': data.stats.highestPackage || college.placements?.highestPackage,
            'placements.medianPackage': data.stats.medianPackage || college.placements?.medianPackage,
            'placements.placementRate': data.stats.placementRate || college.placements?.placementRate,
            'placements.topRecruiters': [
              ...new Set([
                ...(college.placements?.topRecruiters || []),
                ...data.recruiters.map(r => r.company),
              ]),
            ].slice(0, 20),
          },
        }
      );
    }

    logger.info(`[ingestion] Placement data ingested for college ${collegeId}, year ${data.academicYear}`);

    return { success: true, academicYear: data.academicYear };
  },

  /** Parse and ingest a placement PDF buffer */
  async ingestPlacementPdf(
    collegeId: string,
    pdfBuffer: Buffer,
    academicYear: string,
    source: string,
    adminId?: string
  ) {
    const parser = new PlacementPdfParser();
    const parsed = await parser.parseBuffer(pdfBuffer, academicYear);
    return this.ingestPlacement(collegeId, parsed, source, adminId);
  },

  // ─── Logs & Stats ──────────────────────────────────────────

  /** Get ingestion logs */
  async getLogs(source?: string, limit: number = 20) {
    const filter: any = {};
    if (source) filter.source = source;

    return IngestionLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },

  /** Get ingestion stats summary */
  async getStats() {
    const [
      totalRaw,
      pendingCount,
      approvedCount,
      rejectedCount,
      totalColleges,
      totalPlacements,
      recentLogs,
    ] = await Promise.all([
      RawInstitution.countDocuments(),
      RawInstitution.countDocuments({ moderationStatus: 'pending' }),
      RawInstitution.countDocuments({ moderationStatus: 'approved' }),
      RawInstitution.countDocuments({ moderationStatus: 'rejected' }),
      College.countDocuments({ status: 'active' }),
      PlacementRecord.countDocuments(),
      IngestionLog.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return {
      rawInstitutions: { total: totalRaw, pending: pendingCount, approved: approvedCount, rejected: rejectedCount },
      colleges: totalColleges,
      placementRecords: totalPlacements,
      recentLogs,
    };
  },
};

export default ingestionService;
