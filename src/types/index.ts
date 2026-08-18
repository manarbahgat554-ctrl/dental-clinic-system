import type { AIFinding } from '@/types/ai';

export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'assistant' | 'lab_technician' | 'accountant';

export type AIProvider = 'openai' | 'gemini' | 'claude' | 'openrouter' | 'local';

export type Country = {
  id: number;
  name: string;
  iso2: string | null;
  iso3: string | null;
  dialCode: string | null;
  currencyCode: string;
  currencySymbol: string;
  currencyName: string;
  defaultLanguage: string;
  region: string | null;
};

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'in_progress';

export type TreatmentStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

export type ToothStatus =
  | 'healthy'
  | 'needs_treatment'
  | 'completed'
  | 'temporary'
  | 'missing'
  | 'implant'
  | 'root_canal'
  | 'bridge'
  | 'crown'
  | 'filling'
  | 'extraction'
  | 'veneer'
  | 'caries'
  | 'fracture';

export type ToothSurface = 'occlusal' | 'buccal' | 'lingual' | 'mesial' | 'distal';

export type InvoiceStatus = 'unpaid' | 'partial' | 'paid' | 'overdue' | 'refunded';

export type PaymentMethod = 'cash' | 'card' | 'insurance' | 'transfer' | 'other';

export type PatientStatus = 'active' | 'inactive' | 'archived';

export type LabOrderStatus = 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';

export interface Profile {
  id: string;
  clinicId: string | null;
  fullName: string;
  role: UserRole;
  phone: string | null;
  avatarUrl: string | null;
  specialization: string | null;
  licenseNumber: string | null;
  bio: string | null;
  countryId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  clinicId: string;
  countryId: number | null;
  phone: string | null;
  avatarUrl: string | null;
  specialization: string | null;
  licenseNumber: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  workingHours: Record<string, unknown>;
  settings: Record<string, unknown>;
  whatsappNumber: string | null;
  instapayHandle: string | null;
  instapayUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  aiProvider: string;
  aiApiKeyEncrypted: string | null;
  defaultLanguage: string;
  countryId: number | null;
  taxPercentage: number;
  invoicePrefix: string;
  city: string | null;
  timezone: string;
  currencyCode: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  bloodGroup: string | null;
  allergies: string | null;
  currentMedications: string | null;
  medicalHistory: Record<string, unknown>;
  dentalHistory: Record<string, unknown>;
  insuranceProvider: string | null;
  insuranceNumber: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  smoking: boolean;
  pregnant: boolean;
  bloodPressure: string | null;
  diabetes: boolean;
  heartDisease: boolean;
  previousSurgeries: string | null;
  notes: string | null;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string | null;
  chair: string;
  title: string | null;
  treatmentType: string | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  durationMin: number;
  createdAt: string;
  updatedAt: string;
  patient?: Pick<Patient, 'id' | 'firstName' | 'lastName' | 'phone'>;
  doctor?: Pick<Profile, 'id' | 'fullName' | 'specialization'> | null;
}

export interface Treatment {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string | null;
  appointmentId: string | null;
  name: string;
  diagnosis: string | null;
  treatmentPlan: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: TreatmentStatus;
  estimatedCost: number;
  estimatedTimeMin: number;
  progress: number;
  materials: string | null;
  notes: string | null;
  followUpDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ToothRecord {
  id: string;
  clinicId: string;
  patientId: string;
  toothNumber: number;
  isPrimary: boolean;
  status: ToothStatus;
  surfaces: Partial<Record<ToothSurface, ToothStatus>>;
  diagnosis: string | null;
  treatment: string | null;
  clinicalNotes: string | null;
  percussion: string | null;
  palpation: string | null;
  vitalityTest: string | null;
  mobility: string | null;
  pocketDepth: string | null;
  bleeding: boolean;
  rootCanalStatus: string | null;
  restoration: string | null;
  implantStatus: string | null;
  crownStatus: string | null;
  bridgeStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId: string | null;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paidAmount: number;
  status: InvoiceStatus;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: Pick<Patient, 'id' | 'firstName' | 'lastName'>;
}

export interface Payment {
  id: string;
  clinicId: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  clinicId: string;
  name: string;
  category: string | null;
  sku: string | null;
  quantity: number;
  unit: string;
  minQuantity: number;
  unitPrice: number;
  supplier: string | null;
  expiryDate: string | null;
  batchNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabOrder {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string | null;
  workType: string;
  toothNumbers: string | null;
  labName: string | null;
  shade: string | null;
  dueDate: string | null;
  status: LabOrderStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: Pick<Patient, 'id' | 'firstName' | 'lastName'>;
}

export interface RadiologyImage {
  id: string;
  clinicId: string;
  patientId: string;
  uploadedBy: string | null;
  imageUrl: string;
  imageName: string;
  imageType: string;
  fileExt: string | null;
  notes: string | null;
  toothNumber: number | null;
  storagePath: string;
  publicId?: string | null;
  createdAt: string;
}

export interface AIReport {
  id: string;
  clinicId: string;
  patientId: string;
  radiologyImageId: string | null;
  uploadedBy: string | null;
  imageType: string;
  findings: AIFinding[];
  imageQualityScore: number;
  confidenceScore: number;
  riskLevel: string;
  recommendations: string[];
  suggestedTreatmentPlan: string;
  urgencyLevel: string;
  suggestedNextAppointment: string | null;
  reportSummary: string;
  status: string;
  createdAt: string;
}

export interface AIChatMessage {
  id: string;
  clinicId: string;
  patientId: string;
  radiologyImageId: string | null;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface RadiologyComparison {
  id: string;
  clinicId: string;
  patientId: string;
  imageAId: string;
  imageBId: string;
  notes: string | null;
  createdAt: string;
}
