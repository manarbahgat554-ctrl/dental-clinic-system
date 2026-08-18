import { Router } from 'express';
import { listTreatments, createTreatment, updateTreatment } from '../controllers/treatments.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();
router.use(authMiddleware);
router.get('/', listTreatments);
router.post('/', createTreatment);
router.put('/:id', updateTreatment);
export default router;
