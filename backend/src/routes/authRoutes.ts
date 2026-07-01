import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getProfile);
router.patch('/me', authenticate, authController.updateProfile);
router.patch('/password', authenticate, validate(updatePasswordSchema), authController.updatePassword);

export default router;
