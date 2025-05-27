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
        className="text-center py-12"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Thank You for Registering!</h3>
        <p className="text-gray-600 mb-6">A representative will contact you soon.</p>
        <button
          onClick={() => setSubmitSuccess(false)}
          className="btn btn-primary"
        >
          Register Another Student
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Swimming Lesson Registration</h2>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-700">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Package
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <label
                key={pkg.id}
                className="relative cursor-pointer"
              >
                <input
                  type="radio"
                  {...register('package_id', { required: 'Please select a package' })}
                  value={pkg.id}
                  className="peer sr-only"
                />
                <div className="p-4 rounded-lg border-2 peer-checked:border-primary-600 peer-checked:bg-primary-50 hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                  <p className="text-lg font-semibold text-primary-600 mt-2">
                    Le {pkg.price.toLocaleString()}
                  </p>
                </div>
              </label>
            ))}
          </div>
          {errors.package_id && (
            <p className="mt-1 text-sm text-red-600">{errors.package_id.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orange Money / Afri Money Transaction ID
            </label>
            <input
              type="text"
              {...register('transaction_id', { required: 'Transaction ID is required' })}
              className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.transaction_id && (
              <p className="mt-1 text-sm text-red-600">{errors.transaction_id.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full md:w-auto"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SwimmingRegistration;