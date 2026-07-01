import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface ICollege extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  shortName?: string;
  description: string;
  type: 'Government' | 'Private' | 'Deemed' | 'Autonomous';
  established: number;
  
  // Location
  address: {
    street?: string;
    city: string;
    state: string;
    pincode?: string;
    country: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  // Media
  logo?: string;
  coverImage?: string;
  images: string[];
  virtualTourUrl?: string;
  
  // Approvals & Accreditations
  approvals: {
    aicte?: boolean;
    ugc?: boolean;
    naac?: { grade: string; score?: number; validTill?: Date };
    nba?: boolean;
    nirf?: { rank: number; year: number; category: string };
    other: string[];
  };
  
  // Academics
  streams: string[];
  courses: mongoose.Types.ObjectId[];
  totalStudents?: number;
  facultyCount?: number;
  studentFacultyRatio?: string;
  
  // Fees
  fees: {
    min: number;
    max: number;
    hostelMin?: number;
    hostelMax?: number;
  };
  
  // Facilities
  facilities: string[];
  hostel: {
    boys: boolean;
    girls: boolean;
    capacity?: number;
  };
  
  // Contact
  contact: {
    phone?: string[];
    email?: string[];
    website?: string;
    admissionPortal?: string;
  };
  
  // Placements
  placements?: {
    enabled: boolean;
    averagePackage?: number;
    highestPackage?: number;
    medianPackage?: number;
    placementRate?: number;
    topRecruiters: string[];
  };
  
  // Ratings
  rating: number;
  reviewCount: number;
  ratingBreakdown?: {
    academics: number;
    faculty: number;
    infrastructure: number;
    placements: number;
    campusLife: number;
  };
  
  // Status
  status: 'active' | 'pending' | 'inactive';
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  
  // SEO
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const collegeSchema = new Schema<ICollege>(
  {
    name: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    shortName: String,
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      enum: ['Government', 'Private', 'Deemed', 'Autonomous'],
      required: true,
    },
    established: {
      type: Number,
      min: [1800, 'Invalid establishment year'],
      max: [new Date().getFullYear(), 'Invalid establishment year'],
    },
    
    address: {
      street: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: String,
      country: { type: String, default: 'India' },
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    
    logo: String,
    coverImage: String,
    images: [String],
    virtualTourUrl: String,
    
    approvals: {
      aicte: { type: Boolean, default: false },
      ugc: { type: Boolean, default: false },
      naac: {
        grade: String,
        score: Number,
        validTill: Date,
      },
      nba: { type: Boolean, default: false },
      nirf: {
        rank: Number,
        year: Number,
        category: String,
      },
      other: [String],
    },
    
    streams: [String],
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    totalStudents: Number,
    facultyCount: Number,
    studentFacultyRatio: String,
    
    fees: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      hostelMin: Number,
      hostelMax: Number,
    },
    
    facilities: [String],
    hostel: {
      boys: { type: Boolean, default: false },
      girls: { type: Boolean, default: false },
      capacity: Number,
    },
    
    contact: {
      phone: [String],
      email: [String],
      website: String,
      admissionPortal: String,
    },
    
    placements: {
      enabled: { type: Boolean, default: true },
      averagePackage: Number,
      highestPackage: Number,
      medianPackage: Number,
      placementRate: Number,
      topRecruiters: [String],
    },
    
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    ratingBreakdown: {
      academics: { type: Number, default: 0 },
      faculty: { type: Number, default: 0 },
      infrastructure: { type: Number, default: 0 },
      placements: { type: Number, default: 0 },
      campusLife: { type: Number, default: 0 },
    },
    
    status: {
      type: String,
      enum: ['active', 'pending', 'inactive'],
      default: 'pending',
    },
    verifiedAt: Date,
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    
    tags: [String],
    metaTitle: String,
    metaDescription: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate slug before saving
collegeSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Indexes for faster queries
collegeSchema.index({ name: 'text', description: 'text', tags: 'text' });
// slug index removed here — defined inline on schema field
collegeSchema.index({ 'address.city': 1 });
collegeSchema.index({ 'address.state': 1 });
collegeSchema.index({ type: 1 });
collegeSchema.index({ streams: 1 });
collegeSchema.index({ rating: -1 });
collegeSchema.index({ status: 1 });
collegeSchema.index({ 'approvals.nirf.rank': 1 });
collegeSchema.index({ 'fees.min': 1, 'fees.max': 1 });

export const College = mongoose.model<ICollege>('College', collegeSchema);
export default College;
