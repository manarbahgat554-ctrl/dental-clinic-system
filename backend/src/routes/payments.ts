import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { listPayments, createPayment } from '../controllers/invoices.js';

const router = Router();
router.use(authMiddleware);
router.get('/', listPayments);
router.post('/', createPayment);
export default router;
