import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { supabase } from '../../lib/supabase';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';
import { Database } from '../../types/supabase';

type Registration = Database['public']['Tables']['swimming_registrations']['Row'] & {
  swimming_packages?: {
    name: string;
    price: number;
  };
};

type Tutor = {
  id: string;
  name: string;
  type: 'athlete' | 'technical_staff';
};

const AdminRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchRegistrations();
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const [
        { data: athletesData, error: athletesError },
        { data: staffData, error: staffError }
      ] = await Promise.all([
        supabase.from('athletes').select('id, name').order('name'),
        supabase.from('technical_staff').select('id, name').order('name')
      ]);

      if (athletesError) throw athletesError;
      if (staffError) throw staffError;

      const allTutors: Tutor[] = [
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

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <AdminBadge variant="warning" size="sm">Pending Review</AdminBadge>;
      case 'confirmed':
        return <AdminBadge variant="info" size="sm">Confirmed</AdminBadge>;
      case 'completed':
        return <AdminBadge variant="success" size="sm">Completed</AdminBadge>;
      case 'cancelled':
        return <AdminBadge variant="danger" size="sm">Cancelled</AdminBadge>;
      default:
        return <AdminBadge variant="neutral" size="sm">{status}</AdminBadge>;
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      reg.name.toLowerCase().includes(q) ||
      (reg.email && reg.email.toLowerCase().includes(q)) ||
      (reg.phone && reg.phone.toLowerCase().includes(q)) ||
      (reg.transaction_id && reg.transaction_id.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const confirmedCount = registrations.filter(r => r.status === 'confirmed').length;
  const completedCount = registrations.filter(r => r.status === 'completed').length;

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Swimming Registrations"
        description="Process lesson applicants, verify transactions, assign coaches, and track schedule fulfillment."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Athletic Roster' },
          { label: 'Registrations' }
        ]}
      />

      {/* Mini KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="admin-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Orders</p>
            <p className="text-xl font-bold text-slate-900 font-heading mt-0.5">{registrations.length}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <ClipboardList size={18} />
          </div>
        </div>

        <div className="admin-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Pending</p>
            <p className="text-xl font-bold text-secondary-800 font-heading mt-0.5">{pendingCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-secondary-50 text-secondary-700 flex items-center justify-center">
            <Clock size={18} />
          </div>
        </div>

        <div className="admin-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Confirmed</p>
            <p className="text-xl font-bold text-primary-700 font-heading mt-0.5">{confirmedCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="admin-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Completed</p>
            <p className="text-xl font-bold text-accent-700 font-heading mt-0.5">{completedCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-accent-50 text-accent-700 flex items-center justify-center">
            <UserCheck size={18} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, phone, email, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50 transition-all"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {status === 'all' ? 'All Applications' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container Card */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
            <p className="mt-3 text-xs text-slate-500">Loading registrations...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              icon={ClipboardList}
              title={searchQuery || statusFilter !== 'all' ? 'No matching registrations' : 'No registrations recorded'}
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'Try modifying your search or status filter parameters.'
                  : 'Registrations submitted via the public swimming lesson portal will appear here.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Student / Contact</th>
                  <th className="px-4 py-3.5">Package & Price</th>
                  <th className="px-4 py-3.5">Payment Ref</th>
                  <th className="px-4 py-3.5">Assigned Tutor</th>
                  <th className="px-4 py-3.5">Schedule</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Quick Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-semibold text-slate-900">{reg.name}</p>
                        <div className="flex flex-col gap-0.5 text-xs text-slate-500 mt-1">
                          {reg.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={12} className="text-slate-400" /> {reg.email}
                            </span>
                          )}
                          {reg.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} className="text-slate-400" /> {reg.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-medium text-slate-900">
                        {reg.swimming_packages?.name || 'General Lesson'}
                      </p>
                      <p className="text-xs text-primary-600 font-semibold mt-0.5">
                        Le {reg.swimming_packages?.price ? reg.swimming_packages.price.toLocaleString() : '—'}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                      {reg.transaction_id ? (
                        <code className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-700 border border-slate-200">
                          {reg.transaction_id}
                        </code>
                      ) : (
                        <span className="text-slate-400 italic">None provided</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <select
                        value={reg.assigned_tutor_id || ''}
                        onChange={(e) => updateRegistrationDetails(reg.id, 'assigned_tutor_id', e.target.value)}
                        className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50"
                      >
                        <option value="">Assign Coach...</option>
                        {tutors.map((tutor) => (
                          <option key={tutor.id} value={tutor.id}>
                            {tutor.name} ({tutor.type === 'athlete' ? 'Athlete' : 'Staff'})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <input
                        type="text"
                        defaultValue={reg.schedule_notes || ''}
                        onBlur={(e) => updateRegistrationDetails(reg.id, 'schedule_notes', e.target.value)}
                        placeholder="e.g. Saturdays 9 AM"
                        className="w-36 px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50"
                      />
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {renderStatusBadge(reg.status)}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <select
                        value={reg.status}
                        onChange={(e) => updateStatus(reg.id, e.target.value)}
                        className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50"
                      >
                        <option value="pending">Mark Pending</option>
                        <option value="confirmed">Confirm</option>
                        <option value="completed">Complete</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRegistrations;