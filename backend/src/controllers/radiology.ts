import type { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.js';
import { createError } from '../middlewares/error.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import fs from 'fs';

export async function listImages(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const patientId = req.query.patientId as string | undefined;
  const where: Record<string, unknown> = { clinicId: req.user.clinicId };
  if (patientId) where.patientId = patientId;
  const images = await prisma.radiologyImage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json(images);
}

export async function getImage(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const image = await prisma.radiologyImage.findFirst({
    where: { id: req.params.id, clinicId: req.user.clinicId },
  });
  if (!image) throw createError(404, 'Image not found');
  res.json(image);
}

export async function uploadImage(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  if (!req.file) throw createError(400, 'No file uploaded');

  const { patientId, imageType, toothNumber, notes } = req.body;

  if (!patientId) throw createError(400, 'patientId is required');

  try {
    const patient = await prisma.patient.findFirst({
  where: {
    id: patientId,
    clinicId: req.user.clinicId,
  },
});

if (!patient) {
  if (req.file && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }

  throw createError(404, 'Patient not found');
}
    const result = await uploadToCloudinary(req.file.path, req.user.clinicId);

    // Clean up temp file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const image = await prisma.radiologyImage.create({
      data: {
        clinicId: req.user.clinicId,
        patientId,
        uploadedBy: req.user.id,
        imageUrl: result.url,
        publicId: result.publicId,
        imageName: req.file.originalname,
        imageType: imageType || 'Periapical',
        fileExt: result.format,
        toothNumber: toothNumber ? Number(toothNumber) : null,
        notes: notes || null,
      },
    });

    res.status(201).json(image);
  } catch (err) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    throw err;
  }
}

export async function deleteImage(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const image = await prisma.radiologyImage.findFirst({
    where: { id: req.params.id, clinicId: req.user.clinicId },
  });
  if (!image) throw createError(404, 'Image not found');

  if (image.publicId) {
    try { await deleteFromCloudinary(image.publicId); } catch { /* ignore cloudinary errors */ }
  }

  await prisma.radiologyImage.delete({ where: { id: image.id } });
  res.json({ message: 'Image deleted' });
}

// AI Chat Messages
export async function listChatMessages(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const radiologyImageId = req.query.radiologyImageId as string;
  if (!radiologyImageId) throw createError(400, 'radiologyImageId is required');
  const messages = await prisma.aiChatMessage.findMany({
    where: { radiologyImageId, clinicId: req.user.clinicId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(messages);
}

export async function createChatMessage(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const message = await prisma.aiChatMessage.create({
    data: { ...req.body, clinicId: req.user.clinicId },
  });
  res.status(201).json(message);
}

export async function deleteChatMessages(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const { radiologyImageId } = req.body;
  await prisma.aiChatMessage.deleteMany({
    where: { radiologyImageId, clinicId: req.user.clinicId },
  });
  res.json({ message: 'Chat cleared' });
}

// AI Reports
export async function listReports(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const patientId = req.query.patientId as string;
  if (!patientId) throw createError(400, 'patientId is required');
  const reports = await prisma.aiRadiologyReport.findMany({
    where: { patientId, clinicId: req.user.clinicId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(reports);
}

export async function createReport(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const report = await prisma.aiRadiologyReport.create({
    data: { ...req.body, clinicId: req.user.clinicId, uploadedBy: req.user.id },
  });
  res.status(201).json(report);
}
