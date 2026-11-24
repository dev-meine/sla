/*
  # Executive Board Display Ordering

  Adds nullable `display_order` column on `public.board_members` with index
  so admins can optionally override the automatic official protocol hierarchy.
*/

ALTER TABLE public.board_members
  ADD COLUMN IF NOT EXISTS display_order integer;

CREATE INDEX IF NOT EXISTS idx_board_members_order
  ON public.board_members (display_order ASC NULLS LAST, name ASC);
