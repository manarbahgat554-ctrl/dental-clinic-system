/*
# Radiology Images Table + Storage Bucket

## Overview
Creates the `radiology_images` table to track radiology/X-ray/CBCT/intraoral
images uploaded per patient, plus the `radiology-images` Supabase Storage
bucket to hold the binary files. Gallery data lives in the table; files live
in Storage; the table stores the public URL.

## New Table
- `radiology_images`
  - id (uuid PK)
  - clinic_id (uuid FK -> clinics) — tenant scoping
  - patient_id (uuid FK -> patients) — which patient
  - uploaded_by (uuid FK -> profiles) — who uploaded
  - image_url (text) — public Storage URL
  - image_name (text) — original file name
  - image_type (text) — category (Periapical, Bitewing, OPG, CBCT, etc.)
  - file_ext (text) — extension (jpg, png, pdf, stl, dcm)
  - notes (text) — optional clinical notes
  - tooth_number (int) — optional tooth reference
  - storage_path (text) — the path within the bucket (for deletion)
  - created_at (timestamptz)

## Storage
- Creates bucket `radiology-images` (public read so public URLs resolve).

## Security
- RLS enabled on `radiology_images`.
- Clinic-scoped CRUD via `clinic_member_of()` (same pattern as all other tables).
- Storage bucket set public so image URLs render in <img> tags.
*/

CREATE TABLE IF NOT EXISTS public.radiology_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  image_url text NOT NULL,
  image_name text NOT NULL,
  image_type text NOT NULL DEFAULT 'Periapical',
  file_ext text,
  notes text,
  tooth_number int,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.radiology_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_clinic_radiology" ON public.radiology_images;
CREATE POLICY "select_clinic_radiology" ON public.radiology_images FOR SELECT
  TO authenticated USING (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "insert_clinic_radiology" ON public.radiology_images;
CREATE POLICY "insert_clinic_radiology" ON public.radiology_images FOR INSERT
  TO authenticated WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "update_clinic_radiology" ON public.radiology_images;
CREATE POLICY "update_clinic_radiology" ON public.radiology_images FOR UPDATE
  TO authenticated USING (public.clinic_member_of(clinic_id))
  WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "delete_clinic_radiology" ON public.radiology_images;
CREATE POLICY "delete_clinic_radiology" ON public.radiology_images FOR DELETE
  TO authenticated USING (public.clinic_member_of(clinic_id));

CREATE INDEX IF NOT EXISTS idx_radiology_patient ON public.radiology_images(patient_id);
CREATE INDEX IF NOT EXISTS idx_radiology_clinic ON public.radiology_images(clinic_id);

-- Storage bucket (idempotent via DO block)
INSERT INTO storage.buckets (id, name, public)
VALUES ('radiology-images', 'radiology-images', true)
ON CONFLICT (id) DO NOTHING;
