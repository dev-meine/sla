import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/ui/Logo';
import { supabase } from '../lib/supabase';
import { AlertCircle, Lock, Mail, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

const AdminLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes('captcha')) {
          setError('Captcha verification failed. Please try again.');
        } else {
          setError(error.message);
        }
        return;
      }

      // Check if user is admin
      if (authData.session?.user?.user_metadata?.role !== 'admin') {
        await supabase.auth.signOut();
        setError('Unauthorized: Admin access required.');
        return;
      }

      navigate('/admin');
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle brand ambient background decoration */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50/60 via-slate-50 to-slate-100 pointer-events-none" 
      />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white shadow-sm mb-4">
            <Logo size={32} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-[11px] font-semibold text-primary-700 mb-3">
            <ShieldCheck size={13} className="text-primary-600" />
            <span>Official Federation Administration</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Admin Portal Sign In
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Authorized access for Sierra Leone Aquatics officials, media managers, and technical coordinators.
          </p>
        </motion.div>

        <motion.div 
          className="mt-7"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="admin-card p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm rounded-2xl">
            {error && (
              <div className="mb-5 p-3.5 bg-red-50/90 border border-red-200 rounded-xl">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-red-800">{error}</p>
                    {error.includes('captcha') && (
                      <div className="mt-2 text-[11px] text-red-700 space-y-1">
                        <p>Troubleshooting tips:</p>
                        <ul className="list-disc ml-4">
                          <li>Check if your browser blocks third-party cookies</li>
                          <li>Turn off VPN or proxy connections</li>
                          <li>Refresh the page and try again</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="official@sierraleoneaquatics.org"
                    className={`admin-input pl-10 text-xs py-2.5 ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Enter a valid email address'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className={`admin-input pl-10 text-xs py-2.5 ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : ''}`}
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    {...register('rememberMe')}
                  />
                  <span className="text-xs text-slate-600 select-none">Remember credentials</span>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In to Dashboard</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200/80 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Return to main website</span>
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-slate-400" />
              <span>Encrypted 256-bit SSL Session • Sierra Leone Aquatics</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;