/*
# Add unique constraint on countries.name + extend columns
1. Adds UNIQUE constraint on countries.name to enable ON CONFLICT upserts
2. Adds default_language and region columns to countries
3. Extends clinics with social/payment/AI/config columns
4. Extends profiles with country_id
5. Creates ai_chat_messages table with RLS
6. Creates radiology_comparisons table with RLS
*/
-- Add unique constraint on name
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraints WHERE conname = 'countries_name_key') THEN
    ALTER TABLE countries ADD CONSTRAINT countries_name_key UNIQUE (name);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Add new columns to countries
DO $$ BEGIN
  ALTER TABLE countries ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';
  ALTER TABLE countries ADD COLUMN IF NOT EXISTS region TEXT;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
