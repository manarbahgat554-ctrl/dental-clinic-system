import type { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.js';

export async function listCountries(_req: AuthRequest, res: Response) {
  const countries = await prisma.country.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(countries);
}

export async function listCurrencies(_req: AuthRequest, res: Response) {
  const currencies = await prisma.currency.findMany({
    orderBy: { code: 'asc' },
  });
  res.json(currencies);
}
