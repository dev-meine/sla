import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import { supabase } from '../lib/supabase';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session, profile, isLoading: isAuthLoading, refreshProfile } = useAdminAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (!isAuthLoading && session && profile && profile.is_active) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthLoading, session, profile, navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);

      const normalizedEmail = data.email.trim().toLowerCase();

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: data.password,
      });

      if (signInError) {
        const lowerMsg = signInError.message.toLowerCase();
        if (lowerMsg.includes('captcha')) {
          setError('Captcha verification failed. Refresh the page and try again.');
        } else if (lowerMsg.includes('banned')) {
          setError('Your account has been suspended. Please contact a Super Administrator.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      const userId = authData.session?.user?.id;
      if (!userId) {
        setError('Unable to establish an authenticated session.');
        return;
      }

      // Verify authoritative staff profile in public.profiles
      const { data: staffProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, is_active, must_change_password')
        .eq('id', userId)
        .maybeSingle();

      if (profileError || !staffProfile) {
        await supabase.auth.signOut();
        setError('Unauthorized: Staff access required.');
        return;
      }

      if (!staffProfile.is_active) {
        await supabase.auth.signOut();
        setError('Your account has been suspended. Please contact a Super Administrator.');
        return;
      }

      await refreshProfile();
      navigate('/admin', { replace: true });
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-12">
      <div className="w-full max-w-[380px] mx-auto">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-7 sm:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col items-center text-center mb-7">
            <Logo size={40} />
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
              Sign in
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Sierra Leone Aquatics Admin
            </p>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200/80 flex items-start gap-2.5"
            >
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-red-800 leading-relaxed">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                enterKeyHint="next"
                required
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                placeholder="name@sierraleoneaquatics.org"
                className={`admin-input text-base sm:text-sm min-h-[44px] ${
                  errors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : ''
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                    message: 'Enter a valid email address',
                  },
                })}
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  enterKeyHint="done"
                  required
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  placeholder="Enter your password"
                  className={`admin-input pr-10 text-base sm:text-sm min-h-[44px] ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : ''
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to website</span>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default AdminLogin;
