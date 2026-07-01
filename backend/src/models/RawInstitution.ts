/**
 * RawInstitution Model
 * Staging table for scraped data before normalization & approval
 * Data sits here until admin approves → then gets upserted into College
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IRawInstitution extends Document {
  _id: mongoose.Types.ObjectId;
  source: 'aicte' | 'ugc' | 'nirf' | 'college_website' | 'manual';
  sourceId?: string;          // ID from original source for deduplication

  name: string;
  nameNormalized: string;     // lowercase, trimmed, for matching
  shortName?: string;
  description?: string;

  type?: string;              // Government / Private / Deemed
  established?: number;

  // Location
  city?: string;
  state?: string;
  pincode?: string;
  district?: string;
  address?: string;

  // Approvals snapshot from source
  aicteApproved?: boolean;
  aicteId?: string;
  ugcApproved?: boolean;
  ugcId?: string;
  naacGrade?: string;
  naacScore?: number;
  nirfRank?: number;
  nirfYear?: number;
  nirfCategory?: string;
  nirfScore?: number;

  // Contact
  website?: string;
  email?: string;
  phone?: string;

  // Courses / Streams scraped
  courses?: string[];
  streams?: string[];

  // Raw JSON payload from scraper (preserve everything)
  rawPayload?: Record<string, any>;

  // Moderation
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'merged';
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  moderationNote?: string;
  linkedCollegeId?: mongoose.Types.ObjectId; // which College doc this became

  createdAt: Date;
  updatedAt: Date;
}

const rawInstitutionSchema = new Schema<IRawInstitution>(
  {
    source: {
      type: String,
      enum: ['aicte', 'ugc', 'nirf', 'college_website', 'manual'],
      required: true,
    },
    sourceId: String,

    name: { type: String, required: true, trim: true },
    nameNormalized: { type: String, index: true },
    shortName: String,
    description: String,

    type: String,
    established: Number,

    city: String,
    state: String,
    pincode: String,
    district: String,
    address: String,

    aicteApproved: Boolean,
    aicteId: String,
    ugcApproved: Boolean,
    ugcId: String,
    naacGrade: String,
    naacScore: Number,
    nirfRank: Number,
    nirfYear: Number,
    nirfCategory: String,
    nirfScore: Number,

    website: String,
    email: String,
    phone: String,

    courses: [String],
    streams: [String],

    rawPayload: Schema.Types.Mixed,

    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'merged'],
      default: 'pending',
    },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: Date,
    moderationNote: String,
    linkedCollegeId: { type: Schema.Types.ObjectId, ref: 'College' },
  },
  { timestamps: true }
);

// Compound index: prevent duplicates per source
rawInstitutionSchema.index({ source: 1, sourceId: 1 }, { unique: true, sparse: true });
rawInstitutionSchema.index({ source: 1, nameNormalized: 1 });
rawInstitutionSchema.index({ moderationStatus: 1 });

export const RawInstitution = mongoose.model<IRawInstitution>('RawInstitution', rawInstitutionSchema);
export default RawInstitution;
