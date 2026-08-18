import type { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.js';
import { createError } from '../middlewares/error.js';
import { v2 as cloudinary } from 'cloudinary';

export async function uploadClinicLogo(req: AuthRequest, res: Response) {
  console.log('🔥 LOGO UPLOAD HIT');

  if (!req.user) {
    throw createError(401, 'Not authenticated');
  }

  if (!req.file) {
    throw createError(400, 'Logo image is required');
  }

  console.log('👤 USER:', req.user.id);
  console.log('🏥 CLINIC:', req.user.clinicId);
  console.log(
    '📁 FILE:',
    req.file.originalname,
    req.file.mimetype,
    req.file.size
  );
  console.log('📂 FILE PATH:', req.file.path);

  try {
    const clinicId = req.user.clinicId;

    console.log('☁️ STARTING CLOUDINARY UPLOAD...');

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `dentasuite/clinics/${clinicId}`,
      public_id: 'clinic-logo',
      resource_type: 'image',
      overwrite: true,
      invalidate: true,
    });

    console.log('✅ CLOUDINARY RESULT:', result.secure_url);

    const clinic = await prisma.clinic.update({
      where: {
        id: clinicId,
      },
      data: {
        logoUrl: result.secure_url,
      },
    });

    console.log('✅ DATABASE UPDATED:', clinic.id);
    console.log('🖼️ LOGO URL:', clinic.logoUrl);

    res.json(clinic);
  } catch (error) {
    console.error('🔥 LOGO UPLOAD FAILED:', error);

    throw error;
  }
}

export async function getClinic(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const clinic = await prisma.clinic.findUnique({
    where: { id: req.user.clinicId },
    include: { country: true },
  });
  if (!clinic) throw createError(404, 'Clinic not found');
  res.json(clinic);
}

export async function updateClinic(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const clinic = await prisma.clinic.update({
    where: { id: req.user.clinicId },
    data: req.body,
  });
  res.json(clinic);
}

export async function listStaff(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const staff = await prisma.user.findMany({
    where: { clinicId: req.user.clinicId },
    select: {
      id: true, email: true, fullName: true, role: true, phone: true,
      avatarUrl: true, specialization: true, licenseNumber: true, bio: true,
      createdAt: true, updatedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json(staff);
}

export async function getDashboardStats(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const clinicId = req.user.clinicId;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalPatients, todayAppointments, totalAppointments,
    todayRevenue, weekRevenue, monthRevenue, yearRevenue,
    newPatientsThisMonth, activeTreatments, lowStockItems,
  ] = await Promise.all([
    prisma.patient.count({ where: { clinicId } }),
    prisma.appointment.count({ where: { clinicId, startTime: { gte: startOfDay } } }),
    prisma.appointment.count({ where: { clinicId } }),
    prisma.payment.aggregate({ where: { clinicId, createdAt: { gte: startOfDay } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { clinicId, createdAt: { gte: startOfWeek } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { clinicId, createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { clinicId, createdAt: { gte: startOfYear } }, _sum: { amount: true } }),
    prisma.patient.count({ where: { clinicId, createdAt: { gte: startOfMonth } } }),
    prisma.treatment.count({ where: { clinicId, status: 'IN_PROGRESS' } }),
    prisma.inventoryItem.count({ where: { clinicId, quantity: { lte: 5 } } }),
  ]);

  res.json({
    totalPatients,
    todayAppointments,
    totalAppointments,
    todayRevenue: Number(todayRevenue._sum.amount || 0),
    weekRevenue: Number(weekRevenue._sum.amount || 0),
    monthRevenue: Number(monthRevenue._sum.amount || 0),
    yearRevenue: Number(yearRevenue._sum.amount || 0),
    newPatientsThisMonth,
    activeTreatments,
    lowStockItems,
  });
}
