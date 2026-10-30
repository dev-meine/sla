import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import AdminLayout from '../admin/AdminLayout';
import AdminBadge from '../admin/AdminBadge';
import Logo from '../ui/Logo';
import { supabase } from '../../lib/supabase';
import { completeOwnPasswordChange } from '../../lib/adminUsersApi';
import {
  generateStrongPassword,
  MODULE_DEFINITIONS,
  ROLE_METADATA,
  validateStrongPassword,
  type AdminModuleKey,
} from '../../types/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: AdminModuleKey;
  requireSuperAdmin?: boolean;
}

const FirstLoginPasswordRotation: React.FC = () => {
  const { profile, refreshProfile, signOut } = useAdminAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    const generated = generateStrongPassword(16);
    setNewPassword(generated);
    setShowNewPassword(true);
    setError(null);
  };

  const handleCopy = async () => {
    if (!newPassword) return;
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setError(null);

    if (!currentPassword) {
      setError('Please enter the temporary password assigned to your account.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('Your new password must be different from the temporary password.');
      return;
    }

    const validationError = validateStrongPassword(newPassword, profile.email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOwnPasswordChange({
        currentPassword,
        newPassword,
      });

      // Establish a clean session after server-side session revocation
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: newPassword,
      });

      if (signInError) {
        await signOut();
        return;
      }

      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white shadow-sm mb-4">
          <Logo size={30} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800 mb-3">
          <KeyRound size={13} className="text-amber-600" />
          <span>Security Verification Required</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">
          Set Your Personal Password
        </h1>
        <p className="mt-1.5 text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          Signed in as <span className="font-semibold text-slate-900">{profile?.email}</span>. Please replace your administrator-assigned temporary password before accessing the portal.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="admin-card p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm rounded-2xl">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-rose-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="current-password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Temporary Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="current-password"
                  name="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter temporary password"
                  className="admin-input pl-10 pr-10 text-xs py-2.5"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label={showCurrentPassword ? 'Hide temporary password' : 'Show temporary password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-700"
                >
                  {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  New Personal Password
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700"
                  >
                    <RefreshCw size={11} />
                    <span>Generate strong</span>
                  </button>
                  {newPassword && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 ml-2"
                    >
                      {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="relative">
                <KeyRound
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="new-password"
                  name="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={10}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 10 chars, upper, lower, digit & symbol"
                  className="admin-input pl-10 pr-10 text-xs py-2.5 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-700"
                >
                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">
                10–72 characters with uppercase, lowercase, number, and symbol.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={15} />
                  <span>Save Password & Continue</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-center">
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
            >
              <LogOut size={13} />
              <span>Sign out instead</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredModule,
  requireSuperAdmin = false,
}) => {
  const { session, profile, isLoading, isSuperAdmin, hasModule, signOut } = useAdminAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && session && (!profile || !profile.is_active)) {
      void signOut();
    }
  }, [isLoading, session, profile, signOut]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-11 w-11 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!session || !profile || !profile.is_active) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (profile.must_change_password) {
    return <FirstLoginPasswordRotation />;
  }

  const missingSuperAdmin = requireSuperAdmin && !isSuperAdmin;
  const missingModule = Boolean(requiredModule && !hasModule(requiredModule));

  if (missingSuperAdmin || missingModule) {
    const roleMeta = ROLE_METADATA[profile.role] ?? ROLE_METADATA.custom;
    const moduleLabel = requiredModule
      ? MODULE_DEFINITIONS.find((m) => m.key === requiredModule)?.label ?? requiredModule
      : 'Users & Roles Management';

    return (
      <AdminLayout>
        <div className="max-w-lg mx-auto my-12 admin-card p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={22} />
          </div>
          <div className="mb-3">
            <AdminBadge variant={roleMeta.badgeVariant} size="sm">
              {roleMeta.label}
            </AdminBadge>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-heading mb-2">
            Access Restricted
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Your account does not currently have permission to access{' '}
            <span className="font-semibold text-slate-900">{moduleLabel}</span>. Contact a Super Administrator if you need this module enabled on your profile.
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
