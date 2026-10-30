import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AdminModuleKey, AdminRole, StaffProfile } from '../types/rbac';

interface AdminAuthContextValue {
  session: Session | null;
  profile: StaffProfile | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  hasModule: (moduleKey: AdminModuleKey) => boolean;
  refreshProfile: () => Promise<StaffProfile | null>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

function mapRowToStaffProfile(row: {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  permissions: string[];
  is_active: boolean;
  must_change_password: boolean;
  password_reset_at: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}): StaffProfile {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    role: row.role as AdminRole,
    permissions: (row.permissions ?? []) as AdminModuleKey[],
    is_active: row.is_active,
    must_change_password: row.must_change_password,
    password_reset_at: row.password_reset_at,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadedUserIdRef = useRef<string | null>(null);

  const fetchStaffProfile = useCallback(async (userId: string): Promise<StaffProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, email, full_name, avatar_url, role, permissions, is_active, must_change_password, password_reset_at, created_by, created_at, updated_at'
      )
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      loadedUserIdRef.current = null;
      setProfile(null);
      return null;
    }

    const mapped = mapRowToStaffProfile(data);
    loadedUserIdRef.current = mapped.id;
    setProfile(mapped);
    return mapped;
  }, []);

  const refreshProfile = useCallback(async (): Promise<StaffProfile | null> => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    if (!currentSession?.user?.id) {
      setSession(null);
      setProfile(null);
      loadedUserIdRef.current = null;
      return null;
    }

    setSession(currentSession);
    return fetchStaffProfile(currentSession.user.id);
  }, [fetchStaffProfile]);

  const signOut = useCallback(async () => {
    loadedUserIdRef.current = null;
    setProfile(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (!initialSession) {
          setSession(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        // Refresh proactively if expiring within 5 minutes
        const expiresAtMs = initialSession.expires_at ? initialSession.expires_at * 1000 : 0;
        let activeSession = initialSession;
        if (expiresAtMs - Date.now() < 5 * 60 * 1000) {
          const {
            data: { session: refreshed },
            error: refreshErr,
          } = await supabase.auth.refreshSession();
          if (refreshErr || !refreshed) {
            await supabase.auth.signOut();
            if (!isMounted) return;
            setSession(null);
            setProfile(null);
            setIsLoading(false);
            return;
          }
          activeSession = refreshed;
        }

        if (!isMounted) return;
        setSession(activeSession);
        await fetchStaffProfile(activeSession.user.id);
      } catch (err) {
        console.error('AdminAuth initialization error:', err);
        if (isMounted) {
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initialize();

    // Keep onAuthStateChange synchronous to avoid @supabase/supabase-js auth lock deadlocks
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !nextSession) {
        loadedUserIdRef.current = null;
        setSession(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setSession(nextSession);

      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        const isSwitchingUser = loadedUserIdRef.current !== nextSession.user.id;
        if (isSwitchingUser) {
          setIsLoading(true);
        }
        window.setTimeout(() => {
          if (!isMounted) return;
          void fetchStaffProfile(nextSession.user.id).finally(() => {
            if (isMounted) {
              setIsLoading(false);
            }
          });
        }, 0);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchStaffProfile]);

  const isSuperAdmin = useMemo(
    () =>
      Boolean(
        profile &&
          profile.is_active &&
          !profile.must_change_password &&
          profile.role === 'super_admin'
      ),
    [profile]
  );

  const hasModule = useCallback(
    (moduleKey: AdminModuleKey): boolean => {
      if (!profile || !profile.is_active || profile.must_change_password) {
        return false;
      }
      if (profile.role === 'super_admin') {
        return true;
      }
      return profile.permissions.includes(moduleKey);
    },
    [profile]
  );

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      session,
      profile,
      isLoading,
      isSuperAdmin,
      hasModule,
      refreshProfile,
      signOut,
    }),
    [session, profile, isLoading, isSuperAdmin, hasModule, refreshProfile, signOut]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const AdminAuthProviderOutlet: React.FC = () => (
  <AdminAuthProvider>
    <Outlet />
  </AdminAuthProvider>
);

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}
