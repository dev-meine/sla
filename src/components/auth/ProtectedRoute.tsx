import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireSuperAdmin = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setIsAuthenticated(false);
          setIsSuperAdmin(false);
          return;
        }

        if (!session) {
          setIsAuthenticated(false);
          setIsSuperAdmin(false);
          return;
        }

        // Check if session is expired
        if (session.expires_at && session.expires_at <= Math.floor(Date.now() / 1000)) {
          try {
            const { data: { session: refreshedSession }, error: refreshError } = 
              await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.error('Session refresh error:', refreshError);
              setIsAuthenticated(false);
              setIsSuperAdmin(false);
              return;
            }
            
            setIsAuthenticated(!!refreshedSession);

            // Check if user is super admin
            const { data: userData, error: userError } = await supabase
              .from('admin_users')
              .select('is_super_admin')
              .eq('user_id', refreshedSession?.user.id)
              .single();

            if (userError) {
              console.error('Error fetching user role:', userError);
              setIsSuperAdmin(false);
            } else {
              setIsSuperAdmin(userData?.is_super_admin || false);
            }
          } catch (refreshError) {
            console.error('Session refresh error:', refreshError);
            setIsAuthenticated(false);
            setIsSuperAdmin(false);
          }
        } else {
          setIsAuthenticated(true);

          // Check if user is super admin
          const { data: userData, error: userError } = await supabase
            .from('admin_users')
            .select('is_super_admin')
            .eq('user_id', session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user role:', userError);
            setIsSuperAdmin(false);
          } else {
            setIsSuperAdmin(userData?.is_super_admin || false);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsSuperAdmin(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setIsAuthenticated(false);
        setIsSuperAdmin(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(!!session);
        
        if (session) {
          const { data: userData, error: userError } = await supabase
            .from('admin_users')
            .select('is_super_admin')
            .eq('user_id', session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user role:', userError);
            setIsSuperAdmin(false);
          } else {
            setIsSuperAdmin(userData?.is_super_admin || false);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null || (requireSuperAdmin && isSuperAdmin === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;