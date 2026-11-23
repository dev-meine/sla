/*
  # Activities Timeline Metadata & Gallery Section Classification

  1. `public.events`
     - Adds nullable `location`, `display_date`, and `participants` columns for structured 2021–2026 timeline details.
     - Adds descending date index for chronological timeline queries.

  2. `public.gallery_items`
     - Adds `section` column (`main`, `memory_lane`, `press`) defaulting to `'main'` for full backwards compatibility.
     - Adds composite `(section, date DESC)` index.
*/

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS display_date text,
  ADD COLUMN IF NOT EXISTS participants text[];

CREATE INDEX IF NOT EXISTS idx_events_date_desc
  ON public.events (date DESC NULLS LAST);

ALTER TABLE public.gallery_items
  ADD COLUMN IF NOT EXISTS section text NOT NULL DEFAULT 'main';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.gallery_items'::regclass
      AND conname = 'gallery_items_section_check'
  ) THEN
    ALTER TABLE public.gallery_items
      ADD CONSTRAINT gallery_items_section_check
      CHECK (section IN ('main', 'memory_lane', 'press'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gallery_items_section_date
  ON public.gallery_items (section, date DESC);
