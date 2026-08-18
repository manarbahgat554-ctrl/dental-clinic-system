import { Router } from 'express';
import {
  listPatients, getPatient, createPatient, updatePatient, deletePatient,
} from '../controllers/patients.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);
router.get('/', listPatients);
router.get('/:id', getPatient);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;
