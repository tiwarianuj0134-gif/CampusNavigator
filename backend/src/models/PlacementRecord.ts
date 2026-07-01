import mongoose, { Schema, Document } from 'mongoose';

export interface IPlacementRecord extends Document {
  _id: mongoose.Types.ObjectId;
  college: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  academicYear: string; // e.g., "2023-24"
  
  // Statistics
  stats: {
    eligible: number;
    placed: number;
    placementRate: number;
    averagePackage: number;
    medianPackage: number;
    highestPackage: number;
    lowestPackage: number;
  };
  
  // Branch-wise placements
  branchWise?: {
    branch: string;
    eligible: number;
    placed: number;
    averagePackage: number;
    highestPackage: number;
  }[];
  
  // Sector-wise placements
  sectorWise?: {
    sector: string;
    count: number;
    percentage: number;
  }[];
  
  // Recruiters
  recruiters: {
    company: string;
    offers: number;
    package?: number;
    roles?: string[];
  }[];
  
  // Internships
  internships?: {
    total: number;
    averageStipend?: number;
    conversionRate?: number;
  };
  
  // Higher studies
  higherStudies?: {
    total: number;
    abroad: number;
    india: number;
  };
  
  // Source & Verification
  source?: string;
  sourceUrl?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const placementRecordSchema = new Schema<IPlacementRecord>(
  {
    college: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    academicYear: {
      type: String,
      required: true,
    },
    
    stats: {
      eligible: { type: Number, default: 0 },
      placed: { type: Number, default: 0 },
      placementRate: { type: Number, default: 0 },
      averagePackage: { type: Number, default: 0 },
      medianPackage: { type: Number, default: 0 },
      highestPackage: { type: Number, default: 0 },
      lowestPackage: { type: Number, default: 0 },
    },
    
    branchWise: [{
      branch: String,
      eligible: Number,
      placed: Number,
      averagePackage: Number,
      highestPackage: Number,
    }],
    
    sectorWise: [{
      sector: String,
      count: Number,
      percentage: Number,
    }],
    
    recruiters: [{
      company: { type: String, required: true },
      offers: { type: Number, default: 0 },
      package: Number,
      roles: [String],
    }],
    
    internships: {
      total: Number,
      averageStipend: Number,
      conversionRate: Number,
    },
    
    higherStudies: {
      total: Number,
      abroad: Number,
      india: Number,
    },
    
    source: String,
    sourceUrl: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for unique records per college per year
placementRecordSchema.index({ college: 1, academicYear: 1 }, { unique: true });
placementRecordSchema.index({ college: 1, course: 1, academicYear: 1 });

export const PlacementRecord = mongoose.model<IPlacementRecord>('PlacementRecord', placementRecordSchema);
export default PlacementRecord;
