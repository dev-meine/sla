import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Clock, XCircle, User, Calendar, AlertCircle } from 'lucide-react';
import RescheduleRequest from './RescheduleRequest';

interface StatusCheckForm {
  contact: string;
}

interface RegistrationStatus {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  transaction_id: string;
  status: string;
  tutor_name?: string;
  class_date?: string;
  class_time?: string;
  notes?: string;
  created_at: string;
  swimming_packages: {
    name: string;
    price: number;
  } | null;
}

const RegistrationStatusChecker: React.FC = () => {
  const [registration, setRegistration] = useState<RegistrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<StatusCheckForm>();

  const onSubmit = async (data: StatusCheckForm) => {
    try {
      setIsLoading(true);
      setError(null);
      setRegistration(null);
      setHasSearched(true);

      const { data: registrationData, error } = await supabase
        .from('swimming_registrations')
        .select(`
          *,
          swimming_packages (
            name,
            price
          )
        `)
        .or(`email.eq."${data.contact}",phone.eq."${data.contact}"`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('No registration found with this email or phone number.');
        } else {
          throw error;
        }
        return;
      }

      setRegistration(registrationData);
    } catch (error) {
      console.error('Error checking registration status:', error);
      setError('Failed to check registration status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          text: 'Payment Pending Confirmation',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'confirmed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: 'Payment Confirmed',
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
          text: 'Completed',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'cancelled':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          text: 'Cancelled',
          color: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-gray-500" />,
          text: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">Check Registration Status</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your email or phone number
            </label>
            <input
              type="text"
              {...register('contact', { 
                required: 'Email or phone number is required',
                pattern: {
                  value: /^([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|[\d\s\-\+\(\)]+)$/i,
                  message: 'Please enter a valid email or phone number'
                }
              })}
              placeholder="your@email.com or +1234567890"
              className="w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.contact && (
              <p className="mt-1 text-sm text-red-600">{errors.contact.message}</p>
            )}
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Check Status
            </button>
          </div>
        </div>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
        >
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {hasSearched && !registration && !error && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 text-gray-500"
        >
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No registration found with the provided contact information.</p>
        </motion.div>
      )}

      {registration && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border rounded-lg shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{registration.name}</h3>
              <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusInfo(registration.status).color}`}>
                {getStatusInfo(registration.status).icon}
                <span className="text-sm font-medium">{getStatusInfo(registration.status).text}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Registration Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Package:</span>
                    <span className="ml-2 font-medium">{registration.swimming_packages?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <span className="ml-2 font-medium">Le {registration.swimming_packages?.price.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="ml-2 font-mono text-xs">{registration.transaction_id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Registered:</span>
                    <span className="ml-2">{formatDate(registration.created_at)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Class Information</h4>
                <div className="space-y-2 text-sm">
                  {registration.tutor_name ? (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Tutor:</span>
                      <span className="font-medium">{registration.tutor_name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <User className="w-4 h-4" />
                      <span>Tutor not yet assigned</span>
                    </div>
                  )}

                  {registration.class_date ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(registration.class_date)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Class date not yet scheduled</span>
                    </div>
                  )}

                  {registration.class_time && (
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <span className="ml-2 font-medium">{registration.class_time}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {registration.notes && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{registration.notes}</p>
              </div>
            )}

            {/* Reschedule Request Section */}
            {(registration.status === 'scheduled' || registration.status === 'assigned') && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Need to Reschedule?</h4>
                  <button
                    onClick={() => setShowRescheduleForm(!showRescheduleForm)}
                    className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {showRescheduleForm ? 'Cancel' : 'Request Reschedule'}
                  </button>
                </div>
                
                {showRescheduleForm && (
                  <RescheduleRequest
                    registrationId={registration.id}
                    currentDate={registration.class_date}
                    currentTime={registration.class_time}
                    onRequestSent={() => {
                      setShowRescheduleForm(false);
                      // Optionally refresh the registration data
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RegistrationStatusChecker;