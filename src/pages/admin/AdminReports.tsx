import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, Trash2, Search, Calendar, FileText } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { Database } from '../../types/supabase';

type AnonymousReport = Database['public']['Tables']['anonymous_reports']['Row'];

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<AnonymousReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('anonymous_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('anonymous_reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;
      fetchReports();
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setReportToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('anonymous_reports')
        .delete()
        .eq('id', reportToDelete);

      if (error) throw error;
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setReportToDelete(null);
    }
  };

  const renderStatusBadge = (status: string | null) => {
    switch (status) {
      case 'resolved':
        return <AdminBadge variant="success" size="sm">Resolved</AdminBadge>;
      case 'dismissed':
        return <AdminBadge variant="neutral" size="sm">Dismissed</AdminBadge>;
      case 'pending':
      default:
        return <AdminBadge variant="warning" size="sm">Pending Review</AdminBadge>;
    }
  };

  const filteredReports = reports.filter(report => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      report.report_content.toLowerCase().includes(q) ||
      (report.category && report.category.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && (!report.status || report.status === 'pending')) ||
      report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <AdminPageHeader
        title="SafeSport & Confidential Reports"
        description="Review anonymous reports, whistleblowing submissions, safety inquiries, and ethics complaints."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Operations' },
          { label: 'Reports' }
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="admin-card p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search report contents or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50 transition-all"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5">
          {['all', 'pending', 'resolved', 'dismissed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {status === 'all' ? 'All Submissions' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container Card */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
            <p className="mt-3 text-xs text-slate-500">Loading confidential reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              icon={ShieldAlert}
              title={searchQuery || statusFilter !== 'all' ? 'No matching reports' : 'No reports filed'}
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'Try clearing your search or status filter criteria.'
                  : 'SafeSport whistleblowing submissions and athlete inquiries will appear securely here.'
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <AdminBadge variant="danger" size="sm">
                      {report.category || 'General Ethics'}
                    </AdminBadge>
                    {renderStatusBadge(report.status)}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={13} />
                      {report.created_at ? new Date(report.created_at).toLocaleString() : 'Date recorded'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {report.report_content}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end gap-2.5 flex-shrink-0">
                  <select
                    value={report.status || 'pending'}
                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                    className="px-2.5 py-1 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50"
                  >
                    <option value="pending">Mark Pending</option>
                    <option value="resolved">Mark Resolved</option>
                    <option value="dismissed">Mark Dismissed</option>
                  </select>

                  <button
                    onClick={() => handleDeleteClick(report.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setReportToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Confidential Report"
        message="Are you sure you want to permanently delete this report? This action cannot be undone."
        confirmText="Delete Report"
        cancelText="Cancel"
      />
    </AdminLayout>
  );
};

export default AdminReports;