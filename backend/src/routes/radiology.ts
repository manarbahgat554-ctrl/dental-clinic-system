import { Router } from 'express';
import {
  listImages, getImage, uploadImage, deleteImage,
  listChatMessages, createChatMessage, deleteChatMessages,
  listReports, createReport,
} from '../controllers/radiology.js';
import { authMiddleware } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();
router.use(authMiddleware);

router.get('/', listImages);
router.get('/:id', getImage);
router.post('/upload', upload.single('file'), uploadImage);
router.delete('/:id', deleteImage);

router.get('/chat/messages', listChatMessages);
router.post('/chat/messages', createChatMessage);
router.delete('/chat/messages', deleteChatMessages);

router.get('/reports', listReports);
router.post('/reports', createReport);

export default router;
