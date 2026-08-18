import { Router } from 'express';

import {
  getClinic,
  updateClinic,
  listStaff,
  getDashboardStats,
  uploadClinicLogo,
} from '../controllers/clinic.js';

import { authMiddleware } from '../middlewares/auth.js';

import { upload } from '../middlewares/upload.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getClinic);

router.put('/', updateClinic);

router.post('/logo', upload.single('logo'), uploadClinicLogo);

router.get('/staff', listStaff);

router.get('/dashboard-stats', getDashboardStats);

export default router;