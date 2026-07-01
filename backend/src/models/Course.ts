import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  college: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  code?: string;
  degree: string; // B.Tech, M.Tech, MBA, etc.
  stream: string;
  specialization?: string;
  duration: {
    years: number;
    months?: number;
  };
  
  // Eligibility
  eligibility: {
    minPercentage?: number;
    entranceExams?: string[];
    description?: string;
  };
  
  // Fees
  fees: {
    tuition: number;
    total: number;
    perSemester?: number;
    perYear?: number;
    currency: string;
  };
  
  // Seats
  intake: number;
  reservedSeats?: {
    category: string;
    percentage: number;
  }[];
  
  // Placements
  placements?: {
    averagePackage?: number;
    highestPackage?: number;
    placementRate?: number;
    topRecruiters?: string[];
  };
  
  // Curriculum
  semesters?: number;
  curriculum?: {
    semester: number;
    subjects: string[];
  }[];
  
  // Status
  status: 'active' | 'inactive';
  
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    college: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    slug: String,
    code: String,
    degree: {
      type: String,
      required: true,
    },
    stream: {
      type: String,
      required: true,
    },
    specialization: String,
    duration: {
      years: { type: Number, required: true },
      months: Number,
    },
    
    eligibility: {
      minPercentage: Number,
      entranceExams: [String],
      description: String,
    },
    
    fees: {
      tuition: { type: Number, default: 0 },
      total: { type: Number, required: true },
      perSemester: Number,
      perYear: Number,
      currency: { type: String, default: 'INR' },
    },
    
    intake: {
      type: Number,
      default: 0,
    },
    reservedSeats: [{
      category: String,
      percentage: Number,
    }],
    
    placements: {
      averagePackage: Number,
      highestPackage: Number,
      placementRate: Number,
      topRecruiters: [String],
    },
    
    semesters: Number,
    curriculum: [{
      semester: Number,
      subjects: [String],
    }],
    
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
courseSchema.index({ college: 1 });
courseSchema.index({ stream: 1 });
courseSchema.index({ degree: 1 });
courseSchema.index({ 'fees.total': 1 });

export const Course = mongoose.model<ICourse>('Course', courseSchema);
export default Course;
