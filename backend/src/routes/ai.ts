import { Router } from 'express';
import { analyzeImage } from '../controllers/ai.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();
router.use(authMiddleware);
router.post('/analyze', analyzeImage);
export default router;
