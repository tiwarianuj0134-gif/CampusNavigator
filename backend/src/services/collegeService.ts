import { College, ICollege } from '../models/College.js';
import { Course } from '../models/Course.js';
import { Review } from '../models/Review.js';
import { PlacementRecord } from '../models/PlacementRecord.js';
import { AppError } from '../utils/AppError.js';

interface CollegeFilters {
  search?: string;
  city?: string;
  state?: string;
  type?: string;
  stream?: string;
  minFees?: number;
  maxFees?: number;
  minRating?: number;
  approvals?: string[];
  sort?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const collegeService = {
  async getAll(filters: CollegeFilters): Promise<PaginatedResult<ICollege>> {
    const {
      search,
      city,
      state,
      type,
      stream,
      minFees,
      maxFees,
      minRating,
      approvals,
      sort = '-rating',
      page = 1,
      limit = 12,
    } = filters;

    // Build query — always include both active and no-status docs on first load
    const query: any = { status: 'active' };

    // Text search — use $text if index exists, otherwise regex fallback
    if (search) {
      // Use regex search as a safe fallback that always works
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { 'address.city': { $regex: escaped, $options: 'i' } },
        { 'address.state': { $regex: escaped, $options: 'i' } },
        { streams: { $regex: escaped, $options: 'i' } },
        { tags: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
    }

    // Location filters
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');

    // Type filter
    if (type) query.type = type;

    // Stream filter
    if (stream) query.streams = stream;

    // Fee range filter
    if (minFees || maxFees) {
      query['fees.min'] = {};
      if (minFees) query['fees.min'].$gte = minFees;
      if (maxFees) query['fees.max'] = { $lte: maxFees };
    }

    // Rating filter
    if (minRating) query.rating = { $gte: minRating };

    // Approval filters
    if (approvals && approvals.length > 0) {
      approvals.forEach((approval) => {
        if (approval === 'aicte') query['approvals.aicte'] = true;
        if (approval === 'ugc') query['approvals.ugc'] = true;
        if (approval === 'naac') query['approvals.naac.grade'] = { $exists: true };
        if (approval === 'nba') query['approvals.nba'] = true;
      });
    }

    // Sorting
    let sortQuery: any = {};
    switch (sort) {
      case 'rating':
      case '-rating':
        sortQuery = { rating: sort.startsWith('-') ? -1 : 1 };
        break;
      case 'fees':
        sortQuery = { 'fees.min': 1 };
        break;
      case '-fees':
        sortQuery = { 'fees.max': -1 };
        break;
      case 'name':
        sortQuery = { name: 1 };
        break;
      case 'ranking':
        sortQuery = { 'approvals.nirf.rank': 1 };
        break;
      default:
        sortQuery = { rating: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [colleges, total] = await Promise.all([
      College.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean() as any,
      College.countDocuments(query),
    ]);

    return {
      data: colleges as ICollege[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  },

  async getById(id: string): Promise<ICollege> {
    const college = await College.findById(id)
      .populate('courses')
      .lean() as any;

    if (!college) {
      throw new AppError('College not found', 404, 'COLLEGE_NOT_FOUND');
    }

    return college as ICollege;
  },

  async getBySlug(slug: string): Promise<ICollege> {
    const college = await College.findOne({ slug, status: 'active' })
      .populate('courses')
      .lean() as any;

    if (!college) {
      throw new AppError('College not found', 404, 'COLLEGE_NOT_FOUND');
    }

    return college as ICollege;
  },

  async getFeatured(limit: number = 6): Promise<ICollege[]> {
    const colleges = await College.find({
      status: 'active',
      rating: { $gte: 4.0 },
    })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .lean() as any;

    return colleges as ICollege[];
  },

  async getReviews(collegeId: string, page: number = 1, limit: number = 10) {
    const [reviews, total] = await Promise.all([
      Review.find({ college: collegeId, status: 'approved' })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments({ college: collegeId, status: 'approved' }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getCourses(collegeId: string) {
    const courses = await Course.find({ college: collegeId, status: 'active' })
      .sort({ name: 1 })
      .lean();
    return courses;
  },

  async getPlacements(collegeId: string) {
    const placements = await PlacementRecord.find({ college: collegeId })
      .sort({ academicYear: -1 })
      .limit(3)
      .lean();
    return placements;
  },

  async compare(collegeIds: string[]): Promise<ICollege[]> {
    if (collegeIds.length < 2 || collegeIds.length > 4) {
      throw new AppError('Please select 2-4 colleges to compare', 400, 'INVALID_COMPARE');
    }

    const colleges = await College.find({
      _id: { $in: collegeIds },
      status: 'active',
    })
      .populate('courses')
      .lean() as any;

    return colleges as ICollege[];
  },

  // Admin methods
  async create(data: Partial<ICollege>): Promise<ICollege> {
    const college = await College.create(data);
    return college;
  },

  async update(id: string, data: Partial<ICollege>): Promise<ICollege> {
    const college = await College.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!college) {
      throw new AppError('College not found', 404, 'COLLEGE_NOT_FOUND');
    }

    return college;
  },

  async delete(id: string): Promise<void> {
    const college = await College.findByIdAndDelete(id);
    if (!college) {
      throw new AppError('College not found', 404, 'COLLEGE_NOT_FOUND');
    }
  },

  async updateStatus(
    id: string,
    status: 'active' | 'pending' | 'inactive',
    userId: string
  ): Promise<ICollege> {
    const college = await College.findByIdAndUpdate(
      id,
      {
        status,
        verifiedAt: status === 'active' ? new Date() : undefined,
        verifiedBy: status === 'active' ? userId : undefined,
      },
      { new: true }
    );

    if (!college) {
      throw new AppError('College not found', 404, 'COLLEGE_NOT_FOUND');
    }

    return college;
  },
};

export default collegeService;
