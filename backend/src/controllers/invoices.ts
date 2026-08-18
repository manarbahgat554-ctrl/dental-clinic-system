import type { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.js';
import { createError } from '../middlewares/error.js';

export async function listInvoices(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const patientId = req.query.patientId as string | undefined;
  const where: Record<string, unknown> = { clinicId: req.user.clinicId };
  if (patientId) where.patientId = patientId;
  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(invoices);
}

export async function createInvoice(req: AuthRequest, res: Response) {
  if (!req.user) {
    throw createError(401, 'Not authenticated');
  }

  const {
    patientId,
    items,
    subtotal,
    taxAmount,
    discountAmount,
    total,
    paidAmount,
    currency,
    dueDate,
    notes,
  } = req.body;

  if (!patientId) {
    throw createError(400, 'Patient is required');
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

  const count = await prisma.invoice.count({
    where: {
      clinicId: req.user.clinicId,
    },
  });

  const clinic = await prisma.clinic.findUnique({
    where: {
      id: req.user.clinicId,
    },
  });

  const prefix = clinic?.invoicePrefix || 'INV';

  const invoiceNumber = `${prefix}-${String(count + 1).padStart(5, '0')}`;

  const invoiceTotal = Number(
    total ??
    subtotal ??
    0
  );

  const invoiceAmount = Number(
    subtotal ??
    invoiceTotal
  );

  const invoiceTax = Number(taxAmount ?? 0);

  const invoiceDiscount = Number(discountAmount ?? 0);

  const invoicePaid = Number(paidAmount ?? 0);

  
  const invoiceStatus =
  invoicePaid >= invoiceTotal
    ? 'PAID'
    : invoicePaid > 0
      ? 'PARTIAL'
      : 'PENDING';

  const invoice = await prisma.invoice.create({
    data: {
      clinicId: req.user.clinicId,
      patientId,

      invoiceNumber,

      amount: invoiceAmount,

      taxAmount: invoiceTax,

      discountAmount: invoiceDiscount,

      totalAmount: invoiceTotal,

      paidAmount: invoicePaid,

      currency: currency || 'EGP',

      status: invoiceStatus as
        | 'PENDING'
        | 'PAID'
        | 'PARTIAL'
        | 'OVERDUE'
        | 'CANCELLED',

      dueDate: dueDate ? new Date(dueDate) : null,

      items: items ?? null,

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

      payments: true,
    },
  });

  res.status(201).json(invoice);
}
export async function updateInvoice(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');

  const existing = await prisma.invoice.findFirst({
    where: {
      id: req.params.id,
      clinicId: req.user.clinicId,
    },
  });

  if (!existing) {
    throw createError(404, 'Invoice not found');
  }

  const {
    patientId,
    amount,
    taxAmount,
    discountAmount,
    totalAmount,
    paidAmount,
    currency,
    status,
    dueDate,
    items,
    notes,
  } = req.body;

  const allowedStatuses = [
    'PENDING',
    'PAID',
    'PARTIAL',
    'OVERDUE',
    'CANCELLED',
  ];

  let parsedStatus:
    | 'PENDING'
    | 'PAID'
    | 'PARTIAL'
    | 'OVERDUE'
    | 'CANCELLED'
    | undefined;

  if (status !== undefined) {
    const normalizedStatus = String(status).toUpperCase();

    if (!allowedStatuses.includes(normalizedStatus)) {
      throw createError(400, 'Invalid invoice status');
    }

    parsedStatus = normalizedStatus as
      | 'PENDING'
      | 'PAID'
      | 'PARTIAL'
      | 'OVERDUE'
      | 'CANCELLED';
  }

  const updated = await prisma.invoice.update({
    where: {
      id: existing.id,
    },

    data: {
      ...(patientId !== undefined ? { patientId } : {}),

      ...(amount !== undefined
        ? { amount: Number(amount) }
        : {}),

      ...(taxAmount !== undefined
        ? { taxAmount: Number(taxAmount) }
        : {}),

      ...(discountAmount !== undefined
        ? { discountAmount: Number(discountAmount) }
        : {}),

      ...(totalAmount !== undefined
        ? { totalAmount: Number(totalAmount) }
        : {}),

      ...(paidAmount !== undefined
        ? { paidAmount: Number(paidAmount) }
        : {}),

      ...(currency !== undefined
        ? { currency }
        : {}),

      ...(parsedStatus !== undefined
        ? { status: parsedStatus }
        : {}),

      ...(dueDate !== undefined
        ? { dueDate: dueDate ? new Date(dueDate) : null }
        : {}),

      ...(items !== undefined
        ? { items }
        : {}),

      ...(notes !== undefined
        ? { notes: notes || null }
        : {}),
    },

    include: {
      payments: true,
    },
  });

  res.json(updated);
}

export async function listPayments(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const invoiceId = req.query.invoiceId as string | undefined;
  const where: Record<string, unknown> = { clinicId: req.user.clinicId };
  if (invoiceId) where.invoiceId = invoiceId;
  const payments = await prisma.payment.findMany({
    where,
    include: { invoice: { select: { invoiceNumber: true, patient: { select: { firstName: true, lastName: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(payments);
}

export async function createPayment(req: AuthRequest, res: Response) {
  if (!req.user) {
    throw createError(401, 'Not authenticated');
  }

  const { invoiceId, amount, paymentMethod, notes } = req.body;
  void paymentMethod;
  void notes;

  if (!invoiceId) {
    throw createError(400, 'invoiceId is required');
  }

  const paymentAmount = Number(amount);

  if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
    throw createError(400, 'Invalid payment amount');
  }

  // Make sure invoice belongs to current clinic
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      clinicId: req.user.clinicId,
    },
    include: {
      payments: true,
    },
  });

  if (!invoice) {
    throw createError(404, 'Invoice not found');
  }

  const totalAmount = Number(invoice.totalAmount);

  const currentPaid = invoice.payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  const newPaidAmount = currentPaid + paymentAmount;

  if (newPaidAmount > totalAmount) {
    throw createError(
      400,
      `Payment exceeds remaining amount. Remaining: ${(
        totalAmount - currentPaid
      ).toFixed(2)}`,
    );
  }

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      ...req.body,
      amount: paymentAmount,
      clinicId: req.user.clinicId,
    },
  });

  // Calculate status
  const status =
    newPaidAmount >= totalAmount
      ? 'PAID'
      : newPaidAmount > 0
        ? 'PARTIAL'
        : 'PENDING';

  // Update invoice
  const updatedInvoice = await prisma.invoice.update({
    where: {
      id: invoice.id,
    },
    data: {
      paidAmount: newPaidAmount,
      status,
    },
    include: {
      payments: true,
    },
  });

  res.status(201).json({
    payment,
    invoice: updatedInvoice,
  });
}