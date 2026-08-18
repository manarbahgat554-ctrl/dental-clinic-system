import type { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.js';
import { createError } from '../middlewares/error.js';

export async function listLabOrders(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const patientId = req.query.patientId as string | undefined;
  const where: Record<string, unknown> = { clinicId: req.user.clinicId };
  if (patientId) where.patientId = patientId;
  const orders = await prisma.labOrder.findMany({
    where,
    include: { patient: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
}

export async function createLabOrder(req: AuthRequest, res: Response) {
  if (!req.user) {
    throw createError(401, 'Not authenticated');
  }

  const {
    patientId,
    workType,
    description,
    status,
    dueDate,
    cost,
    labName,
    notes,
  } = req.body;

  if (!patientId) {
    throw createError(400, 'Patient is required');
  }

  if (!workType) {
    throw createError(400, 'Work type is required');
  }

  // Make sure patient belongs to current clinic
  const patient = await prisma.patient.findFirst({
    where: {
      id: patientId,
      clinicId: req.user.clinicId,
    },
  });

  if (!patient) {
    throw createError(404, 'Patient not found');
  }

  const count = await prisma.labOrder.count({
    where: {
      clinicId: req.user.clinicId,
    },
  });

  const orderNumber = `LAB-${String(count + 1).padStart(4, '0')}`;

  const allowedStatuses = [
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'DELIVERED',
  ];

  let orderStatus = 'PENDING';

  if (status !== undefined) {
    const normalizedStatus = String(status).toUpperCase();

    if (!allowedStatuses.includes(normalizedStatus)) {
      throw createError(400, 'Invalid lab order status');
    }

    orderStatus = normalizedStatus;
  }

  const order = await prisma.labOrder.create({
    data: {
      patientId,
      clinicId: req.user.clinicId,
      orderNumber,

      workType,
      description: description || null,
      status: orderStatus as
        | 'PENDING'
        | 'IN_PROGRESS'
        | 'COMPLETED'
        | 'CANCELLED'
        | 'DELIVERED',

      dueDate: dueDate ? new Date(dueDate) : null,

      cost: Number(cost ?? 0),

      labName: labName || null,
      notes: notes || null,
    },

    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  res.status(201).json(order);
}

export async function updateLabOrder(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  await prisma.labOrder.updateMany({
    where: { id: req.params.id, clinicId: req.user.clinicId },
    data: req.body,
  });
  const updated = await prisma.labOrder.findUnique({ where: { id: req.params.id } });
  res.json(updated);
}
