/*
  # Admin Users, Role Presets, Per-User Module Permissions & Security Hardening

  1. Private Security Schema (`app_private`)
     - Non-exposed helper & trigger functions with `SET search_path = ''`
     - `is_super_admin()`, `has_module_permission(text)`, `can_manage_storage_object(text, boolean)`
     - Atomic `pg_advisory_xact_lock` trigger preventing removal/demotion/suspension of the last verified Super Admin
     - Immediate `auth.sessions` + `auth.refresh_tokens` revocation trigger on suspension, role/permission change, or password reset

  2. Upgraded `public.profiles` & New `public.admin_audit_logs`
     - Links `public.profiles(id)` -> `auth.users(id) ON DELETE CASCADE`
     - Role presets (`super_admin`, `media_manager`, `technical_coordinator`, `safesport_officer`, `custom`) + `permissions text[]`
     - `is_active`, `must_change_password`, `password_reset_at`, `created_by`
     - Backfills the 4 designated federation Super Admin accounts
     - Client read-only RLS on `profiles` and `admin_audit_logs` (100% writes mediated via `service_role` Edge Function)

  3. Module-Scoped Row-Level Security & Storage Hardening
     - Enforces module permissions across all domain tables and `storage.objects` via non-destructive `ALTER POLICY`
     - Restricts `images` bucket MIME types to JPEG/PNG/GIF/WebP and `gallery_items.url` to HTTP(S)
     - Locks down and neutralizes legacy `public.add_admin_user`, `public.admin_users`, `auth.is_admin`, and `auth.is_super_admin`
*/

-- 1. Create non-exposed private schema for SECURITY DEFINER helpers & triggers
CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role;

-- Harden existing timestamp trigger function search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Upgrade public.profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS permissions text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS password_reset_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('super_admin', 'media_manager', 'technical_coordinator', 'safesport_officer', 'custom'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_permissions_valid_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_permissions_valid_check
      CHECK (permissions <@ ARRAY[
        'athletes',
        'technical_staff',
        'registrations',
        'posts',
        'activities',
        'gallery',
        'board',
        'travel',
        'reports'
      ]::text[]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_non_empty_permissions_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_non_empty_permissions_check
      CHECK (role = 'super_admin' OR cardinality(permissions) >= 1);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_created_by ON public.profiles(created_by);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.profiles'::regclass
      AND tgname = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 3. Backfill the 4 designated Super Admin accounts before enabling triggers
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  permissions,
  is_active,
  must_change_password
)
SELECT
  u.id,
  lower(u.email),
  COALESCE(
    NULLIF(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    initcap(replace(split_part(u.email, '@', 1), '.', ' '))
  ),
  'super_admin',
  ARRAY[
    'athletes',
    'technical_staff',
    'registrations',
    'posts',
    'activities',
    'gallery',
    'board',
    'travel',
    'reports'
  ]::text[],
  true,
  false
FROM auth.users u
WHERE lower(u.email) IN (
  'willamstimothy016@outlook.com',
  'williamstimothy016@gmail.com',
  'techwox@outlook.com',
  'mistamed@gmail.com'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = 'super_admin',
  permissions = EXCLUDED.permissions,
  is_active = true,
  must_change_password = false,
  updated_at = now();

UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
  'role', 'super_admin',
  'permissions', to_jsonb(ARRAY[
    'athletes',
    'technical_staff',
    'registrations',
    'posts',
    'activities',
    'gallery',
    'board',
    'travel',
    'reports'
  ]::text[])
)
WHERE lower(email) IN (
  'willamstimothy016@outlook.com',
  'williamstimothy016@gmail.com',
  'techwox@outlook.com',
  'mistamed@gmail.com'
);

-- 4. Create append-only public.admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text NOT NULL,
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_email text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor_created_at
  ON public.admin_audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_user_id
  ON public.admin_audit_logs(target_user_id);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create app_private RBAC helper & security trigger functions
CREATE OR REPLACE FUNCTION app_private.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'super_admin'
      AND p.is_active = true
      AND p.must_change_password = false
  );
$$;

REVOKE ALL ON FUNCTION app_private.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.is_super_admin() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.has_module_permission(req_module text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.is_active = true
      AND p.must_change_password = false
      AND (
        p.role = 'super_admin'
        OR req_module = ANY(p.permissions)
      )
  );
$$;

REVOKE ALL ON FUNCTION app_private.has_module_permission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.has_module_permission(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.can_manage_storage_object(object_name text, is_insert boolean)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  top_folder text;
  ext text;
BEGIN
  IF object_name IS NULL
     OR object_name = ''
     OR object_name LIKE '%..%'
     OR left(object_name, 1) = '/'
     OR object_name LIKE '%//%' THEN
    RETURN false;
  END IF;

  IF is_insert THEN
    ext := lower(COALESCE(storage.extension(object_name), ''));
    IF ext NOT IN ('jpg', 'jpeg', 'png', 'gif', 'webp') THEN
      RETURN false;
    END IF;
  END IF;

  IF app_private.is_super_admin() THEN
    RETURN true;
  END IF;

  top_folder := (storage.foldername(object_name))[1];

  IF top_folder IS NULL THEN
    IF is_insert THEN
      RETURN false;
    END IF;
    -- Allow legacy root-level image cleanup during edit/removal for active media-capable staff
    RETURN (
      app_private.has_module_permission('athletes')
      OR app_private.has_module_permission('technical_staff')
      OR app_private.has_module_permission('board')
      OR app_private.has_module_permission('gallery')
      OR app_private.has_module_permission('activities')
      OR app_private.has_module_permission('posts')
    );
  END IF;

  CASE lower(top_folder)
    WHEN 'athletes' THEN
      RETURN app_private.has_module_permission('athletes');
    WHEN 'staff' THEN
      RETURN app_private.has_module_permission('technical_staff');
    WHEN 'board', 'board-members' THEN
      RETURN app_private.has_module_permission('board');
    WHEN 'gallery' THEN
      RETURN app_private.has_module_permission('gallery');
    WHEN 'events', 'activities' THEN
      RETURN app_private.has_module_permission('activities');
    WHEN 'news', 'posts' THEN
      RETURN app_private.has_module_permission('posts');
    ELSE
      RETURN false;
  END CASE;
END;
$$;

REVOKE ALL ON FUNCTION app_private.can_manage_storage_object(text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.can_manage_storage_object(text, boolean) TO authenticated, service_role;

-- Atomic transaction-serialized guard preventing lockout of the last verified Super Admin
CREATE OR REPLACE FUNCTION app_private.prevent_last_super_admin_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.role = 'super_admin'
     AND OLD.is_active = true
     AND OLD.must_change_password = false
     AND (
       TG_OP = 'DELETE'
       OR NEW.role <> 'super_admin'
       OR NEW.is_active = false
       OR NEW.must_change_password = true
     ) THEN
    PERFORM pg_advisory_xact_lock(hashtext('sla_last_super_admin_guard'));

    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id <> OLD.id
        AND p.role = 'super_admin'
        AND p.is_active = true
        AND p.must_change_password = false
    ) THEN
      RAISE EXCEPTION 'Cannot remove, suspend, or demote the last active Super Admin.';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION app_private.prevent_last_super_admin_removal() FROM PUBLIC;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.profiles'::regclass
      AND tgname = 'trg_prevent_last_super_admin_removal'
  ) THEN
    CREATE TRIGGER trg_prevent_last_super_admin_removal
      BEFORE UPDATE OR DELETE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION app_private.prevent_last_super_admin_removal();
  END IF;
END $$;

-- Immediate GoTrue session & refresh_token revocation on privilege/status/password change
CREATE OR REPLACE FUNCTION app_private.revoke_sessions_on_privilege_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (OLD.is_active = true AND NEW.is_active = false)
     OR (NEW.role IS DISTINCT FROM OLD.role)
     OR (NEW.permissions IS DISTINCT FROM OLD.permissions)
     OR (NEW.password_reset_at IS DISTINCT FROM OLD.password_reset_at) THEN
    UPDATE auth.sessions
    SET not_after = now() - interval '1 second',
        updated_at = now()
    WHERE user_id = NEW.id
      AND (not_after IS NULL OR not_after > now());

    UPDATE auth.refresh_tokens
    SET revoked = true,
        updated_at = now()
    WHERE user_id = NEW.id::text
      AND COALESCE(revoked, false) = false;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION app_private.revoke_sessions_on_privilege_change() FROM PUBLIC;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.profiles'::regclass
      AND tgname = 'trg_revoke_sessions_on_privilege_change'
  ) THEN
    CREATE TRIGGER trg_revoke_sessions_on_privilege_change
      AFTER UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION app_private.revoke_sessions_on_privilege_change();
  END IF;
END $$;

-- 6. Neutralize and lock down legacy admin functions and unused admin_users table
CREATE OR REPLACE FUNCTION public.add_admin_user(email text, password text, is_super boolean DEFAULT false)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'Retired: use the manage-users Edge Function.';
END;
$$;

REVOKE ALL ON FUNCTION public.add_admin_user(text, text, boolean) FROM PUBLIC, anon, authenticated;

ALTER FUNCTION auth.is_admin(uuid) SECURITY INVOKER SET search_path = '';
REVOKE ALL ON FUNCTION auth.is_admin(uuid) FROM PUBLIC, anon, authenticated;

ALTER FUNCTION auth.is_super_admin(uuid) SECURITY INVOKER SET search_path = '';
REVOKE ALL ON FUNCTION auth.is_super_admin(uuid) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON TABLE public.admin_users FROM PUBLIC, anon, authenticated;
ALTER POLICY "Allow initial super admin setup" ON public.admin_users TO service_role WITH CHECK (false);
ALTER POLICY "Super admins can delete data" ON public.admin_users TO service_role USING (false);
ALTER POLICY "Super admins can insert data" ON public.admin_users TO service_role WITH CHECK (false);
ALTER POLICY "Super admins can update data" ON public.admin_users TO service_role USING (false) WITH CHECK (false);
ALTER POLICY "Users can read own data" ON public.admin_users TO service_role USING (false);

-- 7. Harden Storage bucket MIME allowlist & gallery_items URL scheme constraint
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'images';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.gallery_items'::regclass
      AND conname = 'gallery_items_url_scheme_check'
  ) THEN
    ALTER TABLE public.gallery_items ADD CONSTRAINT gallery_items_url_scheme_check
      CHECK (url ~* '^https?://');
  END IF;
END $$;

-- 8. Apply RLS policies on profiles & admin_audit_logs (client read-only; writes strictly via service_role)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER POLICY "Users can view all profiles"
  ON public.profiles
  TO authenticated
  USING ((SELECT auth.uid()) = id OR app_private.is_super_admin());

ALTER POLICY "Users can insert own profile"
  ON public.profiles
  TO service_role
  WITH CHECK (false);

ALTER POLICY "Users can update own profile"
  ON public.profiles
  TO service_role
  USING (false)
  WITH CHECK (false);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_audit_logs'
      AND policyname = 'Super admins can read audit logs'
  ) THEN
    CREATE POLICY "Super admins can read audit logs"
      ON public.admin_audit_logs
      FOR SELECT
      TO authenticated
      USING (app_private.is_super_admin());
  END IF;
END $$;

-- 9. Module-scoped RLS policies across all domain tables
-- Module: 'athletes'
ALTER POLICY "Allow authenticated users to manage athletes"
  ON public.athletes TO authenticated
  USING (app_private.has_module_permission('athletes'))
  WITH CHECK (app_private.has_module_permission('athletes'));

ALTER POLICY "Allow authenticated users to manage achievements"
  ON public.achievements TO authenticated
  USING (app_private.has_module_permission('athletes'))
  WITH CHECK (app_private.has_module_permission('athletes'));

ALTER POLICY "Allow authenticated users to manage athlete_caps"
  ON public.athlete_caps TO authenticated
  USING (app_private.has_module_permission('athletes'))
  WITH CHECK (app_private.has_module_permission('athletes'));

ALTER POLICY "Allow authenticated users to manage athlete_records"
  ON public.athlete_records TO authenticated
  USING (app_private.has_module_permission('athletes'))
  WITH CHECK (app_private.has_module_permission('athletes'));

ALTER POLICY "Allow authenticated users to manage athlete_specialties"
  ON public.athlete_specialties TO authenticated
  USING (app_private.has_module_permission('athletes'))
  WITH CHECK (app_private.has_module_permission('athletes'));

ALTER POLICY "Allow authenticated users to manage personal_bests"
  ON public.personal_bests TO authenticated
  USING (app_private.has_module_permission('athletes'))
  WITH CHECK (app_private.has_module_permission('athletes'));

ALTER POLICY "Allow authenticated users to manage records"
  ON public.records TO authenticated
  USING (app_private.has_module_permission('athletes'))
  WITH CHECK (app_private.has_module_permission('athletes'));

ALTER POLICY "Allow authenticated users to manage specialties"
  ON public.specialties TO authenticated
  USING (app_private.has_module_permission('athletes'))
  WITH CHECK (app_private.has_module_permission('athletes'));

-- Module: 'technical_staff'
ALTER POLICY "Allow authenticated users to manage technical_staff"
  ON public.technical_staff TO authenticated
  USING (app_private.has_module_permission('technical_staff'))
  WITH CHECK (app_private.has_module_permission('technical_staff'));

-- Module: 'registrations'
ALTER POLICY "Allow authenticated users to manage registrations"
  ON public.swimming_registrations TO authenticated
  USING (app_private.has_module_permission('registrations'))
  WITH CHECK (app_private.has_module_permission('registrations'));

ALTER POLICY "Allow public to check registration status by email or phone"
  ON public.swimming_registrations TO service_role
  USING (false);

ALTER POLICY "Allow authenticated users to manage swimming_packages"
  ON public.swimming_packages TO authenticated
  USING (app_private.has_module_permission('registrations'))
  WITH CHECK (app_private.has_module_permission('registrations'));

ALTER POLICY "Admins can manage all reschedule requests"
  ON public.reschedule_requests TO authenticated
  USING (app_private.has_module_permission('registrations'))
  WITH CHECK (app_private.has_module_permission('registrations'));

ALTER POLICY "Users can view their own reschedule requests"
  ON public.reschedule_requests TO service_role
  USING (false);

-- Module: 'posts'
ALTER POLICY "Allow authenticated users to manage news_posts"
  ON public.news_posts TO authenticated
  USING (app_private.has_module_permission('posts'))
  WITH CHECK (app_private.has_module_permission('posts'));

-- Module: 'activities'
ALTER POLICY "Allow authenticated users to manage events"
  ON public.events TO authenticated
  USING (app_private.has_module_permission('activities'))
  WITH CHECK (app_private.has_module_permission('activities'));

ALTER POLICY "Allow authenticated users to manage activities"
  ON public.activities TO authenticated
  USING (app_private.has_module_permission('activities'))
  WITH CHECK (app_private.has_module_permission('activities'));

-- Module: 'gallery'
ALTER POLICY "Allow authenticated users to manage gallery_items"
  ON public.gallery_items TO authenticated
  USING (app_private.has_module_permission('gallery'))
  WITH CHECK (app_private.has_module_permission('gallery'));

-- Module: 'board'
ALTER POLICY "Allow authenticated users to manage board_members"
  ON public.board_members TO authenticated
  USING (app_private.has_module_permission('board'))
  WITH CHECK (app_private.has_module_permission('board'));

-- Module: 'travel'
ALTER POLICY "Allow authenticated users to manage travel_records"
  ON public.travel_records TO authenticated
  USING (app_private.has_module_permission('travel'))
  WITH CHECK (app_private.has_module_permission('travel'));

ALTER POLICY "Allow authenticated users to manage travel_record_athletes"
  ON public.travel_record_athletes TO authenticated
  USING (app_private.has_module_permission('travel'))
  WITH CHECK (app_private.has_module_permission('travel'));

ALTER POLICY "Allow authenticated users to manage travel_record_staff"
  ON public.travel_record_staff TO authenticated
  USING (app_private.has_module_permission('travel'))
  WITH CHECK (app_private.has_module_permission('travel'));

ALTER POLICY "Allow authenticated users to manage travel_record_board_members"
  ON public.travel_record_board_members TO authenticated
  USING (app_private.has_module_permission('travel'))
  WITH CHECK (app_private.has_module_permission('travel'));

ALTER POLICY "Allow authenticated users to manage ferry_schedules"
  ON public.ferry_schedules TO authenticated
  USING (app_private.has_module_permission('travel'))
  WITH CHECK (app_private.has_module_permission('travel'));

ALTER POLICY "Allow authenticated users to manage flights"
  ON public.flights TO authenticated
  USING (app_private.has_module_permission('travel'))
  WITH CHECK (app_private.has_module_permission('travel'));

-- Module: 'reports' (Confidential Safe Sport anonymous_reports — public INSERT preserved, read/update/delete strictly 'reports')
ALTER POLICY "Allow authenticated users to read reports"
  ON public.anonymous_reports TO authenticated
  USING (app_private.has_module_permission('reports'));

ALTER POLICY "Allow authenticated users to update reports"
  ON public.anonymous_reports TO authenticated
  USING (app_private.has_module_permission('reports'))
  WITH CHECK (app_private.has_module_permission('reports'));

ALTER POLICY "Allow authenticated users to delete reports"
  ON public.anonymous_reports TO authenticated
  USING (app_private.has_module_permission('reports'));

-- Lock down unused public.tasks and public.task_assignments tables from {public}
ALTER POLICY "Users can create tasks"
  ON public.tasks TO authenticated
  WITH CHECK (app_private.is_super_admin());

ALTER POLICY "Users can delete tasks"
  ON public.tasks TO authenticated
  USING (app_private.is_super_admin());

ALTER POLICY "Users can update tasks"
  ON public.tasks TO authenticated
  USING (app_private.is_super_admin())
  WITH CHECK (app_private.is_super_admin());

ALTER POLICY "Users can view all tasks"
  ON public.tasks TO authenticated
  USING (app_private.is_super_admin());

ALTER POLICY "Users can create task assignments"
  ON public.task_assignments TO authenticated
  WITH CHECK (app_private.is_super_admin());

ALTER POLICY "Users can delete task assignments"
  ON public.task_assignments TO authenticated
  USING (app_private.is_super_admin());

ALTER POLICY "Users can view all task assignments"
  ON public.task_assignments TO authenticated
  USING (app_private.is_super_admin());

-- 10. Folder-scoped Storage RLS policies on storage.objects ('images' bucket)
ALTER POLICY "Allow public read access to image objects"
  ON storage.objects TO public
  USING (bucket_id = 'images' AND COALESCE((storage.foldername(name))[1], '') <> 'private');

ALTER POLICY "Allow authenticated users to insert image objects"
  ON storage.objects TO authenticated
  WITH CHECK (bucket_id = 'images' AND app_private.can_manage_storage_object(name, true));

ALTER POLICY "Allow authenticated users to update their image objects"
  ON storage.objects TO authenticated
  USING (bucket_id = 'images' AND app_private.can_manage_storage_object(name, false))
  WITH CHECK (bucket_id = 'images' AND app_private.can_manage_storage_object(name, true));

ALTER POLICY "Allow authenticated users to delete their image objects"
  ON storage.objects TO authenticated
  USING (bucket_id = 'images' AND app_private.can_manage_storage_object(name, false));
