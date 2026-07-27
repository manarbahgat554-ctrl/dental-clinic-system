export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'assistant' | 'lab_technician';

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
  clinic_id: string | null;
  full_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  specialization: string | null;
  license_number: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  working_hours: Record<string, unknown>;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  blood_group: string | null;
  allergies: string | null;
  current_medications: string | null;
  medical_history: Record<string, unknown>;
  dental_history: Record<string, unknown>;
  insurance_provider: string | null;
  insurance_number: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  smoking: boolean;
  pregnant: boolean;
  blood_pressure: string | null;
  diabetes: boolean;
  heart_disease: boolean;
  previous_surgeries: string | null;
  notes: string | null;
  status: PatientStatus;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string | null;
  chair: string;
  title: string | null;
  treatment_type: string | null;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  duration_min: number;
  created_at: string;
  updated_at: string;
  patient?: Pick<Patient, 'id' | 'first_name' | 'last_name' | 'phone'>;
  doctor?: Pick<Profile, 'id' | 'full_name' | 'specialization'> | null;
}

export interface Treatment {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string | null;
  appointment_id: string | null;
  name: string;
  diagnosis: string | null;
  treatment_plan: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: TreatmentStatus;
  estimated_cost: number;
  estimated_time_min: number;
  progress: number;
  materials: string | null;
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToothRecord {
  id: string;
  clinic_id: string;
  patient_id: string;
  tooth_number: number;
  is_primary: boolean;
  status: ToothStatus;
  surfaces: Partial<Record<ToothSurface, ToothStatus>>;
  diagnosis: string | null;
  treatment: string | null;
  clinical_notes: string | null;
  percussion: string | null;
  palpation: string | null;
  vitality_test: string | null;
  mobility: string | null;
  pocket_depth: string | null;
  bleeding: boolean;
  root_canal_status: string | null;
  restoration: string | null;
  implant_status: string | null;
  crown_status: string | null;
  bridge_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  clinic_id: string;
  patient_id: string;
  appointment_id: string | null;
  invoice_number: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  paid_amount: number;
  status: InvoiceStatus;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patient?: Pick<Patient, 'id' | 'first_name' | 'last_name'>;
}

export interface Payment {
  id: string;
  clinic_id: string;
  invoice_id: string;
  patient_id: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  clinic_id: string;
  name: string;
  category: string | null;
  sku: string | null;
  stock_quantity: number;
  unit: string;
  min_stock: number;
  cost_per_unit: number;
  supplier: string | null;
  expiry_date: string | null;
  batch_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface LabOrder {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string | null;
  work_type: string;
  tooth_numbers: string | null;
  lab_name: string | null;
  shade: string | null;
  due_date: string | null;
  status: LabOrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patient?: Pick<Patient, 'id' | 'first_name' | 'last_name'>;
}

export interface RadiologyImage {
  id: string;
  clinic_id: string;
  patient_id: string;
  uploaded_by: string | null;
  image_url: string;
  image_name: string;
  image_type: string;
  file_ext: string | null;
  notes: string | null;
  tooth_number: number | null;
  storage_path: string;
  created_at: string;
}
