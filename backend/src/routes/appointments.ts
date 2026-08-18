import { Router } from 'express';
import {
  listAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment,
} from '../controllers/appointments.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();
router.use(authMiddleware);
router.get('/', listAppointments);
router.get('/:id', getAppointment);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);
export default router;
