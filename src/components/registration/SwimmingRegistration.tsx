import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface SwimmingPackage {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface RegistrationForm {
  name: string;
  email?: string;
  phone?: string;
  transaction_id: string;
  package_id: string;
}

const SwimmingRegistration: React.FC = () => {
  const [packages, setPackages] = useState<SwimmingPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegistrationForm>();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('swimming_packages')
        .select('*')
        .order('price');
      
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RegistrationForm) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const { error } = await supabase
        .from('swimming_registrations')
        .insert([data]);

      if (error) throw error;

      setSubmitSuccess(true);
      reset();
    } catch (error) {
      console.error('Error submitting registration:', error);
      setSubmitError('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-slate-900 mb-2">Thank You for Registering!</h3>
        <p className="text-slate-600 mb-6">A representative will contact you soon.</p>
        <button
          onClick={() => setSubmitSuccess(false)}
          className="px-6 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors"
        >
          Register Another Student
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-slate-900 mb-8">Swimming Lesson Registration</h2>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Select Package
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <label
                key={pkg.id}
                className="relative cursor-pointer flex flex-col h-full"
              >
                <input
                  type="radio"
                  {...register('package_id', { required: 'Please select a package' })}
                  value={pkg.id}
                  className="peer sr-only"
                />
                <div className="h-full flex-1 flex flex-col justify-between p-5 rounded-2xl border-2 border-slate-100 peer-checked:border-primary-600 peer-checked:bg-primary-50 hover:bg-slate-50 transition-all">
                  <div>
                    <h3 className="font-semibold text-slate-900">{pkg.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{pkg.description}</p>
                  </div>
                  <p className="text-lg font-semibold text-primary-600 mt-3 pt-1">
                    Le {pkg.price.toLocaleString()}
                  </p>
                </div>
              </label>
            ))}
          </div>
          {errors.package_id && (
            <p className="mt-2 text-sm text-red-600">{errors.package_id.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white text-slate-900 placeholder:text-slate-400"
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email (Optional)
            </label>
            <input
              type="email"
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white text-slate-900 placeholder:text-slate-400"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white text-slate-900 placeholder:text-slate-400"
              placeholder="+232 XX XXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Orange Money / Afri Money Transaction ID
            </label>
            <input
              type="text"
              {...register('transaction_id', { required: 'Transaction ID is required' })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white text-slate-900 placeholder:text-slate-400"
              placeholder="Enter your transaction ID"
            />
            {errors.transaction_id && (
              <p className="mt-1 text-sm text-red-600">{errors.transaction_id.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SwimmingRegistration;