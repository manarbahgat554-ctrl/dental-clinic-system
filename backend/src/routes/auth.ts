import { Router } from 'express';

import {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  logout,
} from '../controllers/auth.js';

import { authMiddleware } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';

const router = Router();

router.post('/register', asyncHandler(register));

router.post('/login', asyncHandler(login));

router.post('/refresh', asyncHandler(refreshToken));

router.post('/logout', asyncHandler(logout));

router.get(
  '/profile',
  authMiddleware,
  asyncHandler(getProfile),
);

router.put(
  '/profile',
  authMiddleware,
  asyncHandler(updateProfile),
);

export default router;