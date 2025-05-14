-- Add specialties and caps columns to athletes table
ALTER TABLE athletes 
ADD COLUMN IF NOT EXISTS specialties text,
ADD COLUMN IF NOT EXISTS caps text;