import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  isVerified: boolean;
  preferences?: {
    streams: string[];
    locations: string[];
    budget: { min: number; max: number };
    interests: string[];
    studyLevel: string;
  };
  bookmarks: mongoose.Types.ObjectId[];
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    preferences: {
      streams: [String],
      locations: [String],
      budget: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 10000000 },
      },
      interests: [String],
      studyLevel: { type: String, default: '' },
    },
    bookmarks: [{
      type: Schema.Types.ObjectId,
      ref: 'College',
    }],
    refreshToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for faster queries (email index is auto-created by unique:true above)
userSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
export default User;
