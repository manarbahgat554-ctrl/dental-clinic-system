import { Router } from 'express';

import {
  listInventory,
  createInventoryItem,
  updateInventoryItem,
} from '../controllers/inventory.js';

import { authMiddleware } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(listInventory));
router.post('/', asyncHandler(createInventoryItem));
router.put('/:id', asyncHandler(updateInventoryItem));

export default router;