/*
  # Update board_members table image column

  1. Changes
    - Rename image_url column to image in board_members table
    
  2. Notes
    - This change supports storing image URLs from Supabase storage bucket
    - Existing image URLs will be preserved
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'board_members' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE board_members RENAME COLUMN image_url TO image;
  END IF;
END $$;