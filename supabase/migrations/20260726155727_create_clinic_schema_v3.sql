/*
# Dental Clinic Management System — Core Schema (v3)

Fixes the `public.inotics` typo from v2. All statements idempotent.
*/

CREATE TABLE IF NOT EXISTS public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  email text,
  logo_url text,
  working_hours jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'doctor'
    CHECK (role IN ('admin','doctor','receptionist','assistant','lab_technician')),
  phone text,
  avatar_url text,
  specialization text,
  license_number text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.clinic_member_of(target_clinic_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.clinic_id = target_clinic_id
  );
$$;

DROP POLICY IF EXISTS "select_own_clinic" ON public.clinics;
CREATE POLICY "select_own_clinic" ON public.clinics FOR SELECT
  TO authenticated USING (public.clinic_member_of(id));
DROP POLICY IF EXISTS "update_own_clinic" ON public.clinics;
CREATE POLICY "update_own_clinic" ON public.clinics FOR UPDATE
  TO authenticated USING (public.clinic_member_of(id))
  WITH CHECK (public.clinic_member_of(id));

DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT
  TO authenticated USING (public.clinic_member_of(clinic_id) OR id = auth.uid());
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male','female','other')),
  phone text,
  email text,
  address text,
  blood_group text,
  allergies text,
  current_medications text,
  medical_history jsonb DEFAULT '{}'::jsonb,
  dental_history jsonb DEFAULT '{}'::jsonb,
  insurance_provider text,
  insurance_number text,
  emergency_contact_name text,
  emergency_contact_phone text,
  smoking boolean DEFAULT false,
  pregnant boolean DEFAULT false,
  blood_pressure text,
  diabetes boolean DEFAULT false,
  heart_disease boolean DEFAULT false,
  previous_surgeries text,
  notes text,
  status text DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_clinic_patients" ON public.patients;
CREATE POLICY "select_clinic_patients" ON public.patients FOR SELECT
  TO authenticated USING (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "insert_clinic_patients" ON public.patients;
CREATE POLICY "insert_clinic_patients" ON public.patients FOR INSERT
  TO authenticated WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "update_clinic_patients" ON public.patients;
CREATE POLICY "update_clinic_patients" ON public.patients FOR UPDATE
  TO authenticated USING (public.clinic_member_of(clinic_id))
  WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "delete_clinic_patients" ON public.patients;
CREATE POLICY "delete_clinic_patients" ON public.patients FOR DELETE
  TO authenticated USING (public.clinic_member_of(clinic_id));
CREATE INDEX IF NOT EXISTS idx_patients_clinic ON public.patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(first_name, last_name);

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  chair text DEFAULT 'Chair 1',
  title text,
  treatment_type text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled','confirmed','completed','cancelled','no_show','in_progress')),
  notes text,
  duration_min int DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_clinic_appointments" ON public.appointments;
CREATE POLICY "select_clinic_appointments" ON public.appointments FOR SELECT
  TO authenticated USING (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "insert_clinic_appointments" ON public.appointments;
CREATE POLICY "insert_clinic_appointments" ON public.appointments FOR INSERT
  TO authenticated WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "update_clinic_appointments" ON public.appointments;
CREATE POLICY "update_clinic_appointments" ON public.appointments FOR UPDATE
  TO authenticated USING (public.clinic_member_of(clinic_id))
  WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "delete_clinic_appointments" ON public.appointments;
CREATE POLICY "delete_clinic_appointments" ON public.appointments FOR DELETE
  TO authenticated USING (public.clinic_member_of(clinic_id));
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_start ON public.appointments(clinic_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);

CREATE TABLE IF NOT EXISTS public.treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  name text NOT NULL,
  diagnosis text,
  treatment_plan text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status text DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','cancelled','on_hold')),
  estimated_cost numeric(12,2) DEFAULT 0,
  estimated_time_min int DEFAULT 30,
  progress int DEFAULT 0,
  materials text,
  notes text,
  follow_up_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_clinic_treatments" ON public.treatments;
CREATE POLICY "select_clinic_treatments" ON public.treatments FOR SELECT
  TO authenticated USING (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "insert_clinic_treatments" ON public.treatments;
CREATE POLICY "insert_clinic_treatments" ON public.treatments FOR INSERT
  TO authenticated WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "update_clinic_treatments" ON public.treatments;
CREATE POLICY "update_clinic_treatments" ON public.treatments FOR UPDATE
  TO authenticated USING (public.clinic_member_of(clinic_id))
  WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "delete_clinic_treatments" ON public.treatments;
CREATE POLICY "delete_clinic_treatments" ON public.treatments FOR DELETE
  TO authenticated USING (public.clinic_member_of(clinic_id));
CREATE INDEX IF NOT EXISTS idx_treatments_patient ON public.treatments(patient_id);

CREATE TABLE IF NOT EXISTS public.tooth_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  tooth_number int NOT NULL CHECK (tooth_number >= 1 AND tooth_number <= 52),
  is_primary boolean DEFAULT false,
  status text DEFAULT 'healthy' CHECK (status IN ('healthy','needs_treatment','completed','temporary','missing','implant','root_canal','bridge','crown','filling','extraction','veneer','caries','fracture')),
  surfaces jsonb DEFAULT '{}'::jsonb,
  diagnosis text,
  treatment text,
  clinical_notes text,
  percussion text,
  palpation text,
  vitality_test text,
  mobility text,
  pocket_depth text,
  bleeding boolean DEFAULT false,
  root_canal_status text,
  restoration text,
  implant_status text,
  crown_status text,
  bridge_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_id, tooth_number)
);
ALTER TABLE public.tooth_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_clinic_tooth_records" ON public.tooth_records;
CREATE POLICY "select_clinic_tooth_records" ON public.tooth_records FOR SELECT
  TO authenticated USING (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "insert_clinic_tooth_records" ON public.tooth_records;
CREATE POLICY "insert_clinic_tooth_records" ON public.tooth_records FOR INSERT
  TO authenticated WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "update_clinic_tooth_records" ON public.tooth_records;
CREATE POLICY "update_clinic_tooth_records" ON public.tooth_records FOR UPDATE
  TO authenticated USING (public.clinic_member_of(clinic_id))
  WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "delete_clinic_tooth_records" ON public.tooth_records;
CREATE POLICY "delete_clinic_tooth_records" ON public.tooth_records FOR DELETE
  TO authenticated USING (public.clinic_member_of(clinic_id));
CREATE INDEX IF NOT EXISTS idx_tooth_records_patient ON public.tooth_records(patient_id);

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12,2) DEFAULT 0,
  tax_rate numeric(5,2) DEFAULT 0,
  tax_amount numeric(12,2) DEFAULT 0,
  discount numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  paid_amount numeric(12,2) DEFAULT 0,
  status text DEFAULT 'unpaid' CHECK (status IN ('unpaid','partial','paid','overdue','refunded')),
  due_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_clinic_invoices" ON public.invoices;
CREATE POLICY "select_clinic_invoices" ON public.invoices FOR SELECT
  TO authenticated USING (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "insert_clinic_invoices" ON public.invoices;
CREATE POLICY "insert_clinic_invoices" ON public.invoices FOR INSERT
  TO authenticated WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "update_clinic_invoices" ON public.invoices;
CREATE POLICY "update_clinic_invoices" ON public.invoices FOR UPDATE
  TO authenticated USING (public.clinic_member_of(clinic_id))
  WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "delete_clinic_invoices" ON public.invoices;
CREATE POLICY "delete_clinic_invoices" ON public.invoices FOR DELETE
  TO authenticated USING (public.clinic_member_of(clinic_id));
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON public.invoices(patient_id);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  method text DEFAULT 'cash' CHECK (method IN ('cash','card','insurance','transfer','other')),
  reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_clinic_payments" ON public.payments;
CREATE POLICY "select_clinic_payments" ON public.payments FOR SELECT
  TO authenticated USING (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "insert_clinic_payments" ON public.payments;
CREATE POLICY "insert_clinic_payments" ON public.payments FOR INSERT
  TO authenticated WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "update_clinic_payments" ON public.payments;
CREATE POLICY "update_clinic_payments" ON public.payments FOR UPDATE
  TO authenticated USING (public.clinic_member_of(clinic_id))
  WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "delete_clinic_payments" ON public.payments;
CREATE POLICY "delete_clinic_payments" ON public.payments FOR DELETE
  TO authenticated USING (public.clinic_member_of(clinic_id));
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  sku text,
  stock_quantity numeric(12,2) DEFAULT 0,
  unit text DEFAULT 'unit',
  min_stock numeric(12,2) DEFAULT 0,
  cost_per_unit numeric(12,2) DEFAULT 0,
  supplier text,
  expiry_date date,
  batch_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_clinic_inventory" ON public.inventory_items;
CREATE POLICY "select_clinic_inventory" ON public.inventory_items FOR SELECT
  TO authenticated USING (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "insert_clinic_inventory" ON public.inventory_items;
CREATE POLICY "insert_clinic_inventory" ON public.inventory_items FOR INSERT
  TO authenticated WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "update_clinic_inventory" ON public.inventory_items;
CREATE POLICY "update_clinic_inventory" ON public.inventory_items FOR UPDATE
  TO authenticated USING (public.clinic_member_of(clinic_id))
  WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "delete_clinic_inventory" ON public.inventory_items;
CREATE POLICY "delete_clinic_inventory" ON public.inventory_items FOR DELETE
  TO authenticated USING (public.clinic_member_of(clinic_id));
CREATE INDEX IF NOT EXISTS idx_inventory_clinic ON public.inventory_items(clinic_id);

CREATE TABLE IF NOT EXISTS public.lab_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  work_type text NOT NULL,
  tooth_numbers text,
  lab_name text,
  shade text,
  due_date date,
  status text DEFAULT 'pending' CHECK (status IN ('pending','in_progress','ready','delivered','cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_clinic_lab_orders" ON public.lab_orders;
CREATE POLICY "select_clinic_lab_orders" ON public.lab_orders FOR SELECT
  TO authenticated USING (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "insert_clinic_lab_orders" ON public.lab_orders;
CREATE POLICY "insert_clinic_lab_orders" ON public.lab_orders FOR INSERT
  TO authenticated WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "update_clinic_lab_orders" ON public.lab_orders;
CREATE POLICY "update_clinic_lab_orders" ON public.lab_orders FOR UPDATE
  TO authenticated USING (public.clinic_member_of(clinic_id))
  WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "delete_clinic_lab_orders" ON public.lab_orders;
CREATE POLICY "delete_clinic_lab_orders" ON public.lab_orders FOR DELETE
  TO authenticated USING (public.clinic_member_of(clinic_id));
CREATE INDEX IF NOT EXISTS idx_lab_orders_clinic ON public.lab_orders(clinic_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER clinics_touch_updated_at BEFORE UPDATE ON public.clinics
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER profiles_touch_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER patients_touch_updated_at BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER appointments_touch_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER treatments_touch_updated_at BEFORE UPDATE ON public.treatments
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER tooth_records_touch_updated_at BEFORE UPDATE ON public.tooth_records
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER invoices_touch_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER inventory_touch_updated_at BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER lab_orders_touch_updated_at BEFORE UPDATE ON public.lab_orders
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
