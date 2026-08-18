import type { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.js';
import { createError } from '../middlewares/error.js';

export async function listTreatments(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const patientId = req.query.patientId as string | undefined;
  const where: Record<string, unknown> = { clinicId: req.user.clinicId };
  if (patientId) where.patientId = patientId;
  const treatments = await prisma.treatment.findMany({
    where,
    include: { patient: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(treatments);
}

export async function createTreatment(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const treatment = await prisma.treatment.create({
    data: { ...req.body, clinicId: req.user.clinicId },
  });
  res.status(201).json(treatment);
}

export async function updateTreatment(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  await prisma.treatment.updateMany({
    where: { id: req.params.id, clinicId: req.user.clinicId },
    data: req.body,
  });
  const updated = await prisma.treatment.findUnique({ where: { id: req.params.id } });
  res.json(updated);
}
