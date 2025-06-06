import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Database } from '../../types/supabase';

type SwimmingRegistration = Database['public']['Tables']['swimming_registrations']['Row'] & {
  swimming_packages: {
    name: string;
    price: number;
  } | null;
};

interface TutorOption {
  id: string;
  name: string;
  type: 'athlete' | 'technical_staff';
}

const AdminRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<SwimmingRegistration[]>([]);
  const [tutors, setTutors] = useState<TutorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      // Fetch athletes
      const { data: athletesData, error: athletesError } = await supabase
        .from('athletes')
        .select('id, name')
        .order('name');

      // Fetch technical staff
      const { data: staffData, error: staffError } = await supabase
        .from('technical_staff')
        .select('id, name')
        .order('name');

      if (athletesError) throw athletesError;
      if (staffError) throw staffError;

      const allTutors: TutorOption[] = [
        ...(athletesData || []).map(athlete => ({
          id: athlete.id,
          name: athlete.name,
          type: 'athlete' as const
        })),
        ...(staffData || []).map(staff => ({
          id: staff.id,
          name: staff.name,
          type: 'technical_staff' as const
        }))
      ];

      setTutors(allTutors);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('swimming_registrations')
        .select(`
          *,
          swimming_packages (
            name,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('swimming_registrations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating registration status:', error);
    }
  };

  const updateRegistrationDetails = async (id: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('swimming_registrations')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating registration details:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Payment Confirmed
          </span>
        );
      case 'assigned':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle size={12} className="mr-1" />
            Tutor Assigned
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <CheckCircle size={12} className="mr-1" />
            Class Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle size={12} className="mr-1" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Cancelled
          </span>
        );
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Swimming Registrations</h2>
          <p className="text-gray-600 mt-1">
            Manage swimming lesson registrations and payment status
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutor & Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {registration.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {registration.email && (
                          <div className="text-gray-600">{registration.email}</div>
                        )}
                        {registration.phone && (
                          <div className="text-gray-600">{registration.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {registration.swimming_packages?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Le {registration.swimming_packages?.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {registration.transaction_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <select
                          value={registration.tutor_name || ''}
                          onChange={(e) => updateRegistrationDetails(registration.id, 'tutor_name', e.target.value)}
                          className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                          <option value="">Select Tutor</option>
                          <optgroup label="Athletes">
                            {tutors.filter(tutor => tutor.type === 'athlete').map(tutor => (
                              <option key={tutor.id} value={tutor.name}>{tutor.name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Technical Staff">
                            {tutors.filter(tutor => tutor.type === 'technical_staff').map(tutor => (
                              <option key={tutor.id} value={tutor.name}>{tutor.name}</option>
                            ))}
                          </optgroup>
                        </select>
                        <input
                          type="date"
                          value={registration.class_date || ''}
                          onChange={(e) => updateRegistrationDetails(registration.id, 'class_date', e.target.value)}
                          className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                        <input
                          type="time"
                          value={registration.class_time || ''}
                          onChange={(e) => updateRegistrationDetails(registration.id, 'class_time', e.target.value)}
                          className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(registration.status || 'pending')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={registration.status || 'pending'}
                        onChange={(e) => updateStatus(registration.id, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Payment Confirmed</option>
                        <option value="assigned">Tutor Assigned</option>
                        <option value="scheduled">Class Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}

                {registrations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No registrations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRegistrations;