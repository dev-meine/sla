/*
  # Update Personal Bests Schema
  
  1. Changes
    - Add personal_bests text column to athletes table
    - Migrate existing data to new format
    - Drop old personal_bests table
    
  2. Security
    - No changes to RLS policies needed as we're using the existing athletes table
*/

-- First, add the new column to store personal bests as text
ALTER TABLE athletes 
ADD COLUMN IF NOT EXISTS personal_bests text;

-- Migrate existing data to the new format
DO $$ 
BEGIN
  -- Update the personal_bests column with data from athlete_personal_bests table
  UPDATE athletes a
  SET personal_bests = (
    SELECT string_agg(
      pb.event || ' - ' || pb.time_seconds || ' seconds' || 
      CASE 
        WHEN pb.date IS NOT NULL THEN ' (' || to_char(pb.date, 'YYYY-MM-DD') || ')'
        ELSE ''
      END,
      E'\n'
    )
    FROM athlete_personal_bests pb
    WHERE pb.athlete_id = a.id
    GROUP BY pb.athlete_id
  );
END $$;

-- Drop the old table if it exists
DROP TABLE IF EXISTS athlete_personal_bests;