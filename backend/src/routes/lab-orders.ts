import { Router } from 'express';

import {
  listLabOrders,
  createLabOrder,
  updateLabOrder,
} from '../controllers/lab-orders.js';

import { authMiddleware } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(listLabOrders));
router.post('/', asyncHandler(createLabOrder));
router.put('/:id', asyncHandler(updateLabOrder));

export default router;