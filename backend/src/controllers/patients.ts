import type { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.js';
import { createError } from '../middlewares/error.js';

function getPagination(req: AuthRequest) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export async function listPatients(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const { page, limit, skip } = getPagination(req);
  const search = (req.query.search as string) || '';
  const status = req.query.status as string | undefined;

  const where: Record<string, unknown> = { clinicId: req.user.clinicId };
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status;

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.patient.count({ where }),
  ]);

  res.json({
    data: patients,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function getPatient(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const patient = await prisma.patient.findFirst({
    where: { id: req.params.id, clinicId: req.user.clinicId },
  });
  if (!patient) throw createError(404, 'Patient not found');
  res.json(patient);
}

export async function createPatient(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');

  const patient = await prisma.patient.create({
    data: {
      clinicId: req.user.clinicId,

      firstName: req.body.firstName,
      lastName: req.body.lastName,

      dateOfBirth: req.body.dateOfBirth
        ? new Date(req.body.dateOfBirth)
        : null,

      gender: req.body.gender || null,

      bloodGroup: req.body.bloodGroup || null,

      phone: req.body.phone || null,

      email: req.body.email || null,

      address: req.body.address || null,

      emergencyContact:
        req.body.emergencyContactName || null,

      emergencyPhone:
        req.body.emergencyContactPhone || null,

      insuranceProvider:
        req.body.insuranceProvider || null,

      insuranceNumber:
        req.body.insuranceNumber || null,

      medicalHistory:
        req.body.medicalHistory || {},

      allergies:
        req.body.allergies
          ? Array.isArray(req.body.allergies)
            ? req.body.allergies
            : [req.body.allergies]
          : [],

      medications:
        req.body.currentMedications
          ? Array.isArray(req.body.currentMedications)
            ? req.body.currentMedications
            : [req.body.currentMedications]
          : [],

      smoking: req.body.smoking ?? false,

      pregnant: req.body.pregnant ?? false,

      bloodPressure:
        req.body.bloodPressure || null,

      heartCondition:
        req.body.heartDisease ?? false,

      diabetes:
        req.body.diabetes ?? false,

      previousSurgeries:
        req.body.previousSurgeries || null,

      status:
        req.body.status?.toUpperCase() || 'ACTIVE',

      countryId:
        req.body.countryId || null,

      notes:
        req.body.notes || null,
    },
  });

  res.status(201).json(patient);
}

export async function updatePatient(req: AuthRequest, res: Response) {
  if (!req.user) {
    throw createError(401, 'Not authenticated');
  }

  console.log('🔥 UPDATE PATIENT HIT:', req.params.id, req.body);

  const {
    firstName,
    lastName,
    phone,
    email,
    address,
    bloodGroup,
    allergies,
    currentMedications,
    bloodPressure,
    previousSurgeries,
    insuranceProvider,
    insuranceNumber,
    emergencyContactName,
    emergencyContactPhone,
  } = req.body;

  const patient = await prisma.patient.updateMany({
    where: {
      id: req.params.id,
      clinicId: req.user.clinicId,
    },
    data: {
      firstName,
      lastName,
      phone,
      email,
      address,
      bloodGroup,
      allergies,

      // Frontend → Prisma
      medications: currentMedications
  ? currentMedications
      .split(',')
      .map((item: string) => item.trim())
      .filter(Boolean)
  : [],

      // لو الـ DB عندك بيستخدم medicalHistory
      medicalHistory: bloodPressure
        ? { bloodPressure }
        : undefined,

      notes: previousSurgeries || undefined,

      insuranceProvider,
      insuranceNumber,

      emergencyContact: emergencyContactName || undefined,
      emergencyPhone: emergencyContactPhone || undefined,
    },
  });

  if (patient.count === 0) {
    throw createError(404, 'Patient not found');
  }

  const updated = await prisma.patient.findFirst({
    where: {
      id: req.params.id,
      clinicId: req.user.clinicId,
    },
  });

  if (!updated) {
    throw createError(404, 'Patient not found');
  }

  console.log('✅ PATIENT UPDATED:', updated.id);

  return res.status(200).json(updated);
}

export async function deletePatient(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const result = await prisma.patient.deleteMany({
    where: { id: req.params.id, clinicId: req.user.clinicId },
  });
  if (result.count === 0) throw createError(404, 'Patient not found');
  res.json({ message: 'Patient deleted' });
}
