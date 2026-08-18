import type { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.js';
import { createError } from '../middlewares/error.js';

export async function listInventory(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const items = await prisma.inventoryItem.findMany({
    where: { clinicId: req.user.clinicId },
    orderBy: { name: 'asc' },
  });
  res.json(items);
}

export async function createInventoryItem(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');

  const {
    name,
    category,
    sku,
    quantity,
    minQuantity,
    unitPrice,
    supplier,
    expiryDate,
  } = req.body;

  const item = await prisma.inventoryItem.create({
    data: {
      name,
      category: category || null,
      sku: sku || null,
      quantity: Number(quantity ?? 0),
      minQuantity: Number(minQuantity ?? 0),
      unitPrice: Number(unitPrice ?? 0),
      supplier: supplier || null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      clinicId: req.user.clinicId,
    },
  });

  res.status(201).json(item);
}

export async function updateInventoryItem(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  await prisma.inventoryItem.updateMany({
    where: { id: req.params.id, clinicId: req.user.clinicId },
    data: req.body,
  });
  const updated = await prisma.inventoryItem.findUnique({ where: { id: req.params.id } });
  res.json(updated);
}
