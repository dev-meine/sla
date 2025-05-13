import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          setIsAuthenticated(false);
          return;
        }

        // If session exists but is expired, try to refresh
        if (session?.expires_at && session.expires_at <= Math.floor(Date.now() / 1000)) {
          const { data: { session: refreshedSession }, error: refreshError } = 
            await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Session refresh error:', refreshError);
            setIsAuthenticated(false);
            return;
          }
          
          setIsAuthenticated(!!refreshedSession);
        } else {
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
      } else if (event === 'TOKEN_EXPIRED') {
        const { data: { session: refreshedSession }, error } = 
          await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Session refresh error:', error);
          setIsAuthenticated(false);
          return;
        }
        
        setIsAuthenticated(!!refreshedSession);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return path
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;