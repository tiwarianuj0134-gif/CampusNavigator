import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  college: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  
  // Review content
  title: string;
  content: string;
  
  // Ratings (1-5)
  rating: number;
  ratings: {
    academics: number;
    faculty: number;
    infrastructure: number;
    placements: number;
    campusLife: number;
  };
  
  // Metadata
  graduationYear?: number;
  isVerified: boolean;
  isAlumni: boolean;
  
  // Engagement
  helpfulCount: number;
  helpfulBy: mongoose.Types.ObjectId[];
  reportCount: number;
  reportedBy: mongoose.Types.ObjectId[];
  
  // Moderation
  status: 'pending' | 'approved' | 'rejected';
  moderatedAt?: Date;
  moderatedBy?: mongoose.Types.ObjectId;
  moderationNote?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    college: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Review content is required'],
      minlength: [50, 'Review must be at least 50 characters'],
      maxlength: [5000, 'Review cannot exceed 5000 characters'],
    },
    
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    ratings: {
      academics: { type: Number, min: 1, max: 5, required: true },
      faculty: { type: Number, min: 1, max: 5, required: true },
      infrastructure: { type: Number, min: 1, max: 5, required: true },
      placements: { type: Number, min: 1, max: 5, required: true },
      campusLife: { type: Number, min: 1, max: 5, required: true },
    },
    
    graduationYear: Number,
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAlumni: {
      type: Boolean,
      default: false,
    },
    
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    reportCount: {
      type: Number,
      default: 0,
    },
    reportedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    moderatedAt: Date,
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    moderationNote: String,
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews
reviewSchema.index({ user: 1, college: 1 }, { unique: true });
reviewSchema.index({ college: 1, status: 1 });
reviewSchema.index({ rating: -1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
