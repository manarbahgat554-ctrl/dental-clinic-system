/*
# Clinic Globalization: Countries, Clinic Settings, AI Reports

## Overview
Adds multi-country, multi-currency, multi-language support to the clinic system.
Creates a world countries reference table, extends clinics with localization
settings, and creates a table to store AI-generated radiology analysis reports.

## New Tables
1. `countries` — ISO 3166 country reference with dial codes, currencies, timezones
   - id (serial PK)
   - iso2 (char(2), unique) — e.g. EG, SA, US
   - iso3 (char(3), unique) — e.g. EGY, SAU, USA
   - name (text) — English name
   - name_ar (text) — Arabic name
   - dial_code (text) — e.g. +20, +966, +1
   - currency_code (char(3)) — ISO 4217, e.g. EGP, SAR, USD
   - currency_name (text)
   - currency_symbol (text)
   - timezone (text) — default IANA timezone, e.g. Africa/Cairo
   - is_active (boolean, default true)

2. `ai_radiology_reports` — AI-generated X-ray analysis reports
   - id (uuid PK)
   - clinic_id (uuid FK -> clinics)
   - patient_id (uuid FK -> patients)
   - radiology_image_id (uuid FK -> radiology_images, ON DELETE SET NULL)
   - uploaded_by (uuid FK -> profiles)
   - image_type (text) — Panorama, Periapical, Bitewing, CBCT, Cephalometric
   - findings (jsonb) — structured array of detected findings with positions
   - image_quality_score (int) — 0-100
   - confidence_score (int) — 0-100
   - risk_level (text) — low, moderate, high, critical
   - recommendations (jsonb) — array of recommendation strings
   - suggested_treatment_plan (text)
   - urgency_level (text) — routine, soon, urgent, immediate
   - suggested_next_appointment (date)
   - report_summary (text)
   - status (text) — pending, completed, failed
   - created_at (timestamptz)

## Modified Tables
- `clinics` — adds columns: country_id, city, timezone, currency_code,
  language, invoice_prefix, tax_percentage. All nullable for backwards
  compatibility. Uses DO $$ blocks to be idempotent.

## Security
- `countries`: public read (TO authenticated, USING true) — it's reference data.
- `ai_radiology_reports`: clinic-scoped CRUD via clinic_member_of().
- No existing data is modified or deleted.
*/

-- ============================================================
-- 1. COUNTRIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.countries (
  id serial PRIMARY KEY,
  iso2 char(2) UNIQUE NOT NULL,
  iso3 char(3) UNIQUE NOT NULL,
  name text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  dial_code text NOT NULL DEFAULT '',
  currency_code char(3) NOT NULL DEFAULT 'USD',
  currency_name text NOT NULL DEFAULT 'US Dollar',
  currency_symbol text NOT NULL DEFAULT '$',
  timezone text NOT NULL DEFAULT 'UTC',
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_countries" ON public.countries;
CREATE POLICY "select_countries" ON public.countries FOR SELECT
  TO authenticated USING (true);

-- ============================================================
-- 2. SEED COUNTRIES (all major countries worldwide)
-- ============================================================
INSERT INTO public.countries (iso2, iso3, name, name_ar, dial_code, currency_code, currency_name, currency_symbol, timezone) VALUES
('EG', 'EGY', 'Egypt', 'مصر', '+20', 'EGP', 'Egyptian Pound', 'E£', 'Africa/Cairo'),
('SA', 'SAU', 'Saudi Arabia', 'المملكة العربية السعودية', '+966', 'SAR', 'Saudi Riyal', 'ر.س', 'Asia/Riyadh'),
('AE', 'ARE', 'United Arab Emirates', 'الإمارات العربية المتحدة', '+971', 'AED', 'UAE Dirham', 'د.إ', 'Asia/Dubai'),
('QA', 'QAT', 'Qatar', 'قطر', '+974', 'QAR', 'Qatari Riyal', 'ر.ق', 'Asia/Qatar'),
('KW', 'KWT', 'Kuwait', 'الكويت', '+965', 'KWD', 'Kuwaiti Dinar', 'د.ك', 'Asia/Kuwait'),
('BH', 'BHR', 'Bahrain', 'البحرين', '+973', 'BHD', 'Bahraini Dinar', '.د.ب', 'Asia/Bahrain'),
('OM', 'OMN', 'Oman', 'عمان', '+968', 'OMR', 'Omani Rial', 'ر.ع.', 'Asia/Muscat'),
('JO', 'JOR', 'Jordan', 'الأردن', '+962', 'JOD', 'Jordanian Dinar', 'د.ا', 'Asia/Amman'),
('LB', 'LBN', 'Lebanon', 'لبنان', '+961', 'LBP', 'Lebanese Pound', 'ل.ل', 'Asia/Beirut'),
('IQ', 'IRQ', 'Iraq', 'العراق', '+964', 'IQD', 'Iraqi Dinar', 'ع.د', 'Asia/Baghdad'),
('US', 'USA', 'United States', 'الولايات المتحدة', '+1', 'USD', 'US Dollar', '$', 'America/New_York'),
('CA', 'CAN', 'Canada', 'كندا', '+1', 'CAD', 'Canadian Dollar', 'C$', 'America/Toronto'),
('GB', 'GBR', 'United Kingdom', 'المملكة المتحدة', '+44', 'GBP', 'Pound Sterling', '£', 'Europe/London'),
('DE', 'DEU', 'Germany', 'ألمانيا', '+49', 'EUR', 'Euro', '€', 'Europe/Berlin'),
('FR', 'FRA', 'France', 'فرنسا', '+33', 'EUR', 'Euro', '€', 'Europe/Paris'),
('IT', 'ITA', 'Italy', 'إيطاليا', '+39', 'EUR', 'Euro', '€', 'Europe/Rome'),
('ES', 'ESP', 'Spain', 'إسبانيا', '+34', 'EUR', 'Euro', '€', 'Europe/Madrid'),
('TR', 'TUR', 'Turkey', 'تركيا', '+90', 'TRY', 'Turkish Lira', '₺', 'Europe/Istanbul'),
('AU', 'AUS', 'Australia', 'أستراليا', '+61', 'AUD', 'Australian Dollar', 'A$', 'Australia/Sydney'),
('IN', 'IND', 'India', 'الهند', '+91', 'INR', 'Indian Rupee', '₹', 'Asia/Kolkata'),
('JP', 'JPN', 'Japan', 'اليابان', '+81', 'JPY', 'Japanese Yen', '¥', 'Asia/Tokyo'),
('CN', 'CHN', 'China', 'الصين', '+86', 'CNY', 'Chinese Yuan', '¥', 'Asia/Shanghai'),
('CH', 'CHE', 'Switzerland', 'سويسرا', '+41', 'CHF', 'Swiss Franc', 'CHF', 'Europe/Zurich'),
('NL', 'NLD', 'Netherlands', 'هولندا', '+31', 'EUR', 'Euro', '€', 'Europe/Amsterdam'),
('BE', 'BEL', 'Belgium', 'بلجيكا', '+32', 'EUR', 'Euro', '€', 'Europe/Brussels'),
('SE', 'SWE', 'Sweden', 'السويد', '+46', 'SEK', 'Swedish Krona', 'kr', 'Europe/Stockholm'),
('NO', 'NOR', 'Norway', 'النرويج', '+47', 'NOK', 'Norwegian Krone', 'kr', 'Europe/Oslo'),
('DK', 'DNK', 'Denmark', 'الدنمارك', '+45', 'DKK', 'Danish Krone', 'kr', 'Europe/Copenhagen'),
('FI', 'FIN', 'Finland', 'فنلندا', '+358', 'EUR', 'Euro', '€', 'Europe/Helsinki'),
('PT', 'PRT', 'Portugal', 'البرتغال', '+351', 'EUR', 'Euro', '€', 'Europe/Lisbon'),
('GR', 'GRC', 'Greece', 'اليونان', '+30', 'EUR', 'Euro', '€', 'Europe/Athens'),
('AT', 'AUT', 'Austria', 'النمسا', '+43', 'EUR', 'Euro', '€', 'Europe/Vienna'),
('IE', 'IRL', 'Ireland', 'أيرلندا', '+353', 'EUR', 'Euro', '€', 'Europe/Dublin'),
('PL', 'POL', 'Poland', 'بولندا', '+48', 'PLN', 'Polish Zloty', 'zł', 'Europe/Warsaw'),
('CZ', 'CZE', 'Czech Republic', 'التشيك', '+420', 'CZK', 'Czech Koruna', 'Kč', 'Europe/Prague'),
('RU', 'RUS', 'Russia', 'روسيا', '+7', 'RUB', 'Russian Ruble', '₽', 'Europe/Moscow'),
('UA', 'UKR', 'Ukraine', 'أوكرانيا', '+380', 'UAH', 'Ukrainian Hryvnia', '₴', 'Europe/Kyiv'),
('BR', 'BRA', 'Brazil', 'البرازيل', '+55', 'BRL', 'Brazilian Real', 'R$', 'America/Sao_Paulo'),
('MX', 'MEX', 'Mexico', 'المكسيك', '+52', 'MXN', 'Mexican Peso', '$', 'America/Mexico_City'),
('AR', 'ARG', 'Argentina', 'الأرجنتين', '+54', 'ARS', 'Argentine Peso', '$', 'America/Argentina/Buenos_Aires'),
('CL', 'CHL', 'Chile', 'تشيلي', '+56', 'CLP', 'Chilean Peso', '$', 'America/Santiago'),
('CO', 'COL', 'Colombia', 'كولومبيا', '+57', 'COP', 'Colombian Peso', '$', 'America/Bogota'),
('PE', 'PER', 'Peru', 'بيرو', '+51', 'PEN', 'Peruvian Sol', 'S/', 'America/Lima'),
('VE', 'VEN', 'Venezuela', 'فنزويلا', '+58', 'VES', 'Venezuelan Bolívar', 'Bs', 'America/Caracas'),
('ZA', 'ZAF', 'South Africa', 'جنوب أفريقيا', '+27', 'ZAR', 'South African Rand', 'R', 'Africa/Johannesburg'),
('NG', 'NGA', 'Nigeria', 'نيجيريا', '+234', 'NGN', 'Nigerian Naira', '₦', 'Africa/Lagos'),
('KE', 'KEN', 'Kenya', 'كينيا', '+254', 'KES', 'Kenyan Shilling', 'KSh', 'Africa/Nairobi'),
('MA', 'MAR', 'Morocco', 'المغرب', '+212', 'MAD', 'Moroccan Dirham', 'د.م.', 'Africa/Casablanca'),
('TN', 'TUN', 'Tunisia', 'تونس', '+216', 'TND', 'Tunisian Dinar', 'د.ت', 'Africa/Tunis'),
('DZ', 'DZA', 'Algeria', 'الجزائر', '+213', 'DZD', 'Algerian Dinar', 'د.ج', 'Africa/Algiers'),
('LY', 'LBY', 'Libya', 'ليبيا', '+218', 'LYD', 'Libyan Dinar', 'ل.د', 'Africa/Tripoli'),
('SD', 'SDN', 'Sudan', 'السودان', '+249', 'SDG', 'Sudanese Pound', 'ج.س.', 'Africa/Khartoum'),
('YE', 'YEM', 'Yemen', 'اليمن', '+967', 'YER', 'Yemeni Rial', 'ر.ي', 'Asia/Aden'),
('SY', 'SYR', 'Syria', 'سوريا', '+963', 'SYP', 'Syrian Pound', 'ل.س', 'Asia/Damascus'),
('PS', 'PSE', 'Palestine', 'فلسطين', '+970', 'ILS', 'Israeli Shekel', '₪', 'Asia/Gaza'),
('IR', 'IRN', 'Iran', 'إيران', '+98', 'IRR', 'Iranian Rial', '﷼', 'Asia/Tehran'),
('PK', 'PAK', 'Pakistan', 'باكستان', '+92', 'PKR', 'Pakistani Rupee', '₨', 'Asia/Karachi'),
('BD', 'BGD', 'Bangladesh', 'بنغلاديش', '+880', 'BDT', 'Bangladeshi Taka', '৳', 'Asia/Dhaka'),
('ID', 'IDN', 'Indonesia', 'إندونيسيا', '+62', 'IDR', 'Indonesian Rupiah', 'Rp', 'Asia/Jakarta'),
('MY', 'MYS', 'Malaysia', 'ماليزيا', '+60', 'MYR', 'Malaysian Ringgit', 'RM', 'Asia/Kuala_Lumpur'),
('SG', 'SGP', 'Singapore', 'سنغافورة', '+65', 'SGD', 'Singapore Dollar', 'S$', 'Asia/Singapore'),
('TH', 'THA', 'Thailand', 'تايلاند', '+66', 'THB', 'Thai Baht', '฿', 'Asia/Bangkok'),
('PH', 'PHL', 'Philippines', 'الفلبين', '+63', 'PHP', 'Philippine Peso', '₱', 'Asia/Manila'),
('VN', 'VNM', 'Vietnam', 'فيتنام', '+84', 'VND', 'Vietnamese Dong', '₫', 'Asia/Ho_Chi_Minh'),
('KR', 'KOR', 'South Korea', 'كوريا الجنوبية', '+82', 'KRW', 'South Korean Won', '₩', 'Asia/Seoul'),
('NZ', 'NZL', 'New Zealand', 'نيوزيلندا', '+64', 'NZD', 'NZ Dollar', 'NZ$', 'Pacific/Auckland'),
('HK', 'HKG', 'Hong Kong', 'هونغ كونغ', '+852', 'HKD', 'HK Dollar', 'HK$', 'Asia/Hong_Kong')
ON CONFLICT (iso2) DO NOTHING;

-- ============================================================
-- 3. EXTEND CLINICS TABLE WITH LOCALIZATION COLUMNS
-- ============================================================
DO $$ BEGIN
  ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS country_id int REFERENCES public.countries(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS city text;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS currency_code char(3) DEFAULT 'USD';
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS invoice_prefix text DEFAULT 'INV';
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS tax_percentage numeric(5,2) DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ============================================================
-- 4. AI RADIOLOGY REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_radiology_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  radiology_image_id uuid REFERENCES public.radiology_images(id) ON DELETE SET NULL,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  image_type text NOT NULL,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_quality_score int DEFAULT 0,
  confidence_score int DEFAULT 0,
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low','moderate','high','critical')),
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  suggested_treatment_plan text,
  urgency_level text DEFAULT 'routine' CHECK (urgency_level IN ('routine','soon','urgent','immediate')),
  suggested_next_appointment date,
  report_summary text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_radiology_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_clinic_ai_reports" ON public.ai_radiology_reports;
CREATE POLICY "select_clinic_ai_reports" ON public.ai_radiology_reports FOR SELECT
  TO authenticated USING (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "insert_clinic_ai_reports" ON public.ai_radiology_reports;
CREATE POLICY "insert_clinic_ai_reports" ON public.ai_radiology_reports FOR INSERT
  TO authenticated WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "update_clinic_ai_reports" ON public.ai_radiology_reports;
CREATE POLICY "update_clinic_ai_reports" ON public.ai_radiology_reports FOR UPDATE
  TO authenticated USING (public.clinic_member_of(clinic_id))
  WITH CHECK (public.clinic_member_of(clinic_id));
DROP POLICY IF EXISTS "delete_clinic_ai_reports" ON public.ai_radiology_reports;
CREATE POLICY "delete_clinic_ai_reports" ON public.ai_radiology_reports FOR DELETE
  TO authenticated USING (public.clinic_member_of(clinic_id));

CREATE INDEX IF NOT EXISTS idx_ai_reports_patient ON public.ai_radiology_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_clinic ON public.ai_radiology_reports(clinic_id);
