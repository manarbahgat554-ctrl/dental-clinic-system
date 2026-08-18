import type { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.js';
import { createError } from '../middlewares/error.js';

function getPagination(req: AuthRequest) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit as string) || 20)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

// ============================================================
// List Appointments
// ============================================================

export async function listAppointments(req: AuthRequest, res: Response) {
  if (!req.user) {
    throw createError(401, 'Not authenticated');
  }

  const { page, limit, skip } = getPagination(req);

  const where: Record<string, unknown> = {
    clinicId: req.user.clinicId,
  };

  const patientId = req.query.patientId as string | undefined;
  const doctorId = req.query.doctorId as string | undefined;
  const status = req.query.status as string | undefined;

  if (patientId) {
    where.patientId = patientId;
  }

  if (doctorId) {
    where.doctorId = doctorId;
  }

  if (status) {
    where.status = status.toUpperCase();
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        startTime: 'asc',
      },
      include: {
        patient: true,
        doctor: true,
      },
    }),

    prisma.appointment.count({
      where,
    }),
  ]);

  res.json({
    data: appointments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// ============================================================
// Get Appointment
// ============================================================

export async function getAppointment(req: AuthRequest, res: Response) {
  if (!req.user) {
    throw createError(401, 'Not authenticated');
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: req.params.id,
      clinicId: req.user.clinicId,
    },
    include: {
      patient: true,
      doctor: true,
    },
  });

  if (!appointment) {
    throw createError(404, 'Appointment not found');
  }

  res.json(appointment);
}

// ============================================================
// Create Appointment
// ============================================================

export async function createAppointment(req: AuthRequest, res: Response) {
  if (!req.user) {
    throw createError(401, 'Not authenticated');
  }

  const {
    patientId,
    doctorId,
    title,
    description,
    startTime,
    endTime,
    status,
    type,
    notes,
  } = req.body;

  // ------------------------------------------------------------
  // Validate required fields
  // ------------------------------------------------------------

  if (!patientId) {
    throw createError(400, 'Patient is required');
  }

  if (!startTime) {
    throw createError(400, 'Start time is required');
  }

  if (!endTime) {
    throw createError(400, 'End time is required');
  }

  // ------------------------------------------------------------
  // Validate dates
  // ------------------------------------------------------------

  const parsedStartTime = new Date(startTime);
  const parsedEndTime = new Date(endTime);

  if (Number.isNaN(parsedStartTime.getTime())) {
    throw createError(400, 'Invalid start time');
  }

  if (Number.isNaN(parsedEndTime.getTime())) {
    throw createError(400, 'Invalid end time');
  }

  if (parsedEndTime <= parsedStartTime) {
    throw createError(400, 'End time must be after start time');
  }

  // ------------------------------------------------------------
  // Make sure patient belongs to current clinic
  // ------------------------------------------------------------

  const patient = await prisma.patient.findFirst({
    where: {
      id: patientId,
      clinicId: req.user.clinicId,
    },
  });

  if (!patient) {
    throw createError(404, 'Patient not found');
  }

  // ------------------------------------------------------------
  // Make sure doctor belongs to current clinic
  // ------------------------------------------------------------

  if (doctorId) {
    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
        clinicId: req.user.clinicId,
      },
    });

    if (!doctor) {
      throw createError(404, 'Doctor not found');
    }
  }

  // ------------------------------------------------------------
  // Validate appointment status
  // ------------------------------------------------------------

  const allowedStatuses = [
    'SCHEDULED',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ];

  const appointmentStatus = status
    ? String(status).toUpperCase()
    : 'SCHEDULED';

  if (!allowedStatuses.includes(appointmentStatus)) {
    throw createError(400, 'Invalid appointment status');
  }

  // ------------------------------------------------------------
  // Create appointment
  // ------------------------------------------------------------

  const appointment = await prisma.appointment.create({
    data: {
      clinicId: req.user.clinicId,
      patientId,

      ...(doctorId ? { doctorId } : {}),

      title: title?.trim() || 'Appointment',

      description:
        description !== undefined && description !== ''
          ? description
          : null,

      startTime: parsedStartTime,
      endTime: parsedEndTime,

      status: appointmentStatus as
        | 'SCHEDULED'
        | 'CONFIRMED'
        | 'COMPLETED'
        | 'CANCELLED'
        | 'NO_SHOW',

      type: type || null,
      notes: notes || null,
    },

    include: {
      patient: true,
      doctor: true,
    },
  });

  res.status(201).json(appointment);
}

// ============================================================
// Update Appointment
// ============================================================

export async function updateAppointment(req: AuthRequest, res: Response) {
  if (!req.user) {
    throw createError(401, 'Not authenticated');
  }

  // ------------------------------------------------------------
  // Make sure appointment belongs to current clinic
  // ------------------------------------------------------------

  const existing = await prisma.appointment.findFirst({
    where: {
      id: req.params.id,
      clinicId: req.user.clinicId,
    },
  });

  if (!existing) {
    throw createError(404, 'Appointment not found');
  }

  const {
    patientId,
    doctorId,
    title,
    description,
    startTime,
    endTime,
    status,
    type,
    notes,
  } = req.body;

  // ------------------------------------------------------------
  // Validate patient
  // ------------------------------------------------------------

  if (patientId) {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        clinicId: req.user.clinicId,
      },
    });

    if (!patient) {
      throw createError(404, 'Patient not found');
    }
  }

  // ------------------------------------------------------------
  // Validate doctor
  // ------------------------------------------------------------

  if (doctorId) {
    const doctor = await prisma.user.findFirst({
      where: {
        id: doctorId,
        clinicId: req.user.clinicId,
      },
    });

    if (!doctor) {
      throw createError(404, 'Doctor not found');
    }
  }

  // ------------------------------------------------------------
  // Validate dates
  // ------------------------------------------------------------

  let parsedStartTime: Date | undefined;
  let parsedEndTime: Date | undefined;

  if (startTime !== undefined) {
    parsedStartTime = new Date(startTime);

    if (Number.isNaN(parsedStartTime.getTime())) {
      throw createError(400, 'Invalid start time');
    }
  }

  if (endTime !== undefined) {
    parsedEndTime = new Date(endTime);

    if (Number.isNaN(parsedEndTime.getTime())) {
      throw createError(400, 'Invalid end time');
    }
  }

  const finalStartTime = parsedStartTime ?? existing.startTime;
  const finalEndTime = parsedEndTime ?? existing.endTime;

  if (finalEndTime <= finalStartTime) {
    throw createError(400, 'End time must be after start time');
  }

  // ------------------------------------------------------------
  // Validate status
  // ------------------------------------------------------------

  const allowedStatuses = [
    'SCHEDULED',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ];

  let parsedStatus:
    | 'SCHEDULED'
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW'
    | undefined;

  if (status !== undefined) {
    const upperStatus = String(status).toUpperCase();

    if (!allowedStatuses.includes(upperStatus)) {
      throw createError(400, 'Invalid appointment status');
    }

    parsedStatus = upperStatus as
      | 'SCHEDULED'
      | 'CONFIRMED'
      | 'COMPLETED'
      | 'CANCELLED'
      | 'NO_SHOW';
  }

  // ------------------------------------------------------------
  // Update appointment
  // ------------------------------------------------------------

  const appointment = await prisma.appointment.update({
    where: {
      id: req.params.id,
    },

    data: {
      ...(patientId !== undefined ? { patientId } : {}),

      ...(doctorId !== undefined
        ? { doctorId: doctorId || null }
        : {}),

      ...(title !== undefined
        ? { title: title?.trim() || 'Appointment' }
        : {}),

      ...(description !== undefined
        ? { description: description || null }
        : {}),

      ...(parsedStartTime
        ? { startTime: parsedStartTime }
        : {}),

      ...(parsedEndTime
        ? { endTime: parsedEndTime }
        : {}),

      ...(parsedStatus
        ? { status: parsedStatus }
        : {}),

      ...(type !== undefined
        ? { type: type || null }
        : {}),

      ...(notes !== undefined
        ? { notes: notes || null }
        : {}),
    },

    include: {
      patient: true,
      doctor: true,
    },
  });

  res.json(appointment);
}

// ============================================================
// Delete Appointment
// ============================================================

export async function deleteAppointment(req: AuthRequest, res: Response) {
  if (!req.user) {
    throw createError(401, 'Not authenticated');
  }

  // ------------------------------------------------------------
  // Make sure appointment belongs to current clinic
  // ------------------------------------------------------------

  const existing = await prisma.appointment.findFirst({
    where: {
      id: req.params.id,
      clinicId: req.user.clinicId,
    },
  });

  if (!existing) {
    throw createError(404, 'Appointment not found');
  }

  await prisma.appointment.delete({
    where: {
      id: req.params.id,
    },
  });

  res.json({
    message: 'Appointment deleted',
  });
}