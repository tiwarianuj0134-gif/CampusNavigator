import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import config from '../config/index.js';
import { AppError } from '../utils/AppError.js';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: Partial<IUser>;
  tokens: TokenPair;
}

const generateTokens = (userId: string, role: string): TokenPair => {
  const accessToken = jwt.sign(
    { id: userId, role },
    config.JWT_SECRET as string,
    { expiresIn: config.JWT_EXPIRES_IN as any }
  );

  const refreshToken = jwt.sign(
    { id: userId, role },
    config.JWT_REFRESH_SECRET as string,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN as any }
  );

  return { accessToken, refreshToken };
};

const sanitizeUser = (user: IUser): Partial<IUser> => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    isVerified: user.isVerified,
    preferences: user.preferences,
    createdAt: user.createdAt,
  };
};

export const authService = {
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Create user
    const user = await User.create({ name, email, password });
    
    // Generate tokens
    const tokens = generateTokens(user._id.toString(), user.role);
    
    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: sanitizeUser(user),
      tokens,
    };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const tokens = generateTokens(user._id.toString(), user.role);
    
    // Update refresh token and last login
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      user: sanitizeUser(user),
      tokens,
    };
  },

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { id: string; role: string };
      
      // Find user with matching refresh token
      const user = await User.findById(decoded.id).select('+refreshToken');
      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
      }

      // Generate new tokens
      const tokens = generateTokens(user._id.toString(), user.role);
      
      // Save new refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
      }
      throw error;
    }
  },

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  },

  async getProfile(userId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId).populate('bookmarks');
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return sanitizeUser(user);
  },

  async updateProfile(
    userId: string,
    updates: Partial<IUser>
  ): Promise<Partial<IUser>> {
    // Prevent updating sensitive fields
    const { password, role, email, refreshToken, ...safeUpdates } = updates as any;

    const user = await User.findByIdAndUpdate(
      userId,
      safeUpdates,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return sanitizeUser(user);
  },

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
    }

    user.password = newPassword;
    await user.save();
  },
};

export default authService;
