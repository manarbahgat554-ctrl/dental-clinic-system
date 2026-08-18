import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import type { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middlewares/auth.js';
import { createError as httpError } from '../middlewares/error.js';
function signToken(user: { id: string; email: string; role: string; clinicId: string; fullName: string }) {
  const secret = process.env.JWT_SECRET as Secret;
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(user, secret, options);
}

function signRefreshToken(user: { id: string; email: string; role: string; clinicId: string; fullName: string }) {
  const secret = process.env.JWT_REFRESH_SECRET as Secret;
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(user, secret, options);
}

export async function register(req: AuthRequest, res: Response) {
  const { email, password, fullName, role, countryId } = req.body;

  if (!email || !password || !fullName || !role) {
    throw httpError(400, 'Email, password, full name, and role are required');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw httpError(409, 'Email already registered');
  }

  // Determine clinic: first admin creates a new clinic, all others join existing
  let clinicId: string;

  const existingClinics = await prisma.clinic.findFirst({ orderBy: { createdAt: 'asc' } });

  if (role === 'ADMIN' && !existingClinics) {
    // First admin — auto-create clinic
    const clinic = await prisma.clinic.create({
      data: {
        name: `${fullName}'s Clinic`,
        countryId: countryId ? Number(countryId) : null,
      },
    });
    clinicId = clinic.id;
  } else if (role === 'ADMIN' && existingClinics) {
    // Additional admin joins existing clinic
    clinicId = existingClinics.id;
  } else {
    // Non-admin must join existing clinic — never null
    if (!existingClinics) {
      const clinic = await prisma.clinic.create({
        data: {
          name: 'Main Clinic',
          countryId: countryId ? Number(countryId) : null,
        },
      });
      clinicId = clinic.id;
    } else {
      clinicId = existingClinics.id;
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role,
      clinicId,
      countryId: countryId ? Number(countryId) : null,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      clinicId: true,
      countryId: true,
      phone: true,
      avatarUrl: true,
      specialization: true,
      licenseNumber: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // If country selected, set clinic defaults
  if (countryId) {
    const country = await prisma.country.findUnique({ where: { id: Number(countryId) } });
    if (country) {
      await prisma.clinic.update({
        where: { id: clinicId },
        data: {
          language: country.defaultLanguage,
          defaultLanguage: country.defaultLanguage,
          currencyCode: country.currencyCode,
          countryId: country.id,
        },
      });
    }
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    clinicId: user.clinicId,
    fullName: user.fullName,
  };

  const token = signToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  res.status(201).json({ user, token, refreshToken });
}

export async function login(req: AuthRequest, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw httpError(400, 'Email and password are required');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw httpError(401, 'Invalid credentials');
  }

  if (!user.isActive) {
    throw httpError(403, 'Account deactivated');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw httpError(401, 'Invalid credentials');
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    clinicId: user.clinicId,
    fullName: user.fullName,
  };

  const token = signToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      clinicId: user.clinicId,
      countryId: user.countryId,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      specialization: user.specialization,
      licenseNumber: user.licenseNumber,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
    refreshToken,
  });
}

export async function refreshToken(req: AuthRequest, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw httpError(400, 'Refresh token required');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      id: string; email: string; role: string; clinicId: string; fullName: string;
    };
    const token = signToken(decoded);
    res.json({ token });
  } catch {
    throw httpError(401, 'Invalid refresh token');
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  if (!req.user) throw httpError(401, 'Not authenticated');

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      clinicId: true,
      countryId: true,
      phone: true,
      avatarUrl: true,
      specialization: true,
      licenseNumber: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw httpError(404, 'User not found');
  res.json({ user });
}

export async function updateProfile(req: AuthRequest, res: Response) {
  if (!req.user) throw httpError(401, 'Not authenticated');

  const { fullName, phone, avatarUrl, specialization, licenseNumber, bio } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(fullName && { fullName }),
      ...(phone !== undefined && { phone }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(specialization !== undefined && { specialization }),
      ...(licenseNumber !== undefined && { licenseNumber }),
      ...(bio !== undefined && { bio }),
    },
    select: {
      id: true, email: true, fullName: true, role: true, clinicId: true,
      countryId: true, phone: true, avatarUrl: true, specialization: true,
      licenseNumber: true, bio: true, createdAt: true, updatedAt: true,
    },
  });

  res.json({ user });
}

export async function logout(_req: AuthRequest, res: Response) {
  // JWT is stateless — client discards token. Return success.
  res.json({ message: 'Logged out successfully' });
}
