import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { Database } from '../../types/supabase';

type AnonymousReport = Database['public']['Tables']['anonymous_reports']['Row'];

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<AnonymousReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'dismissed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold flex items-center">
              <AlertTriangle className="text-red-500 mr-2" />
              Anonymous Reports
            </h2>
            <p className="text-gray-600 mt-1">
              Review and manage anonymous reports submitted through the contact page.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500 ml-4">
                      {new Date(report.created_at).toLocaleDateString()} at{' '}
                      {new Date(report.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStatusChange(report.id, 'resolved')}
                      className="p-2 text-green-600 hover:text-green-800"
                      title="Mark as Resolved"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => handleStatusChange(report.id, 'dismissed')}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Dismiss Report"
                    >
                      <XCircle size={20} />
                    </button>
                    <button
                      onClick={() => handleStatusChange(report.id, 'pending')}
                      className="p-2 text-yellow-600 hover:text-yellow-800"
                      title="Mark as Pending"
                    >
                      <Clock size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(report.id)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                      title="Delete Report"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm font-medium text-gray-500 mb-2">Category</div>
                  <div className="text-gray-900">{report.category}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500 mb-2">Report Content</div>
                  <div className="text-gray-900 whitespace-pre-wrap">{report.report_content}</div>
                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Reports</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no anonymous reports to display.
                </p>
              </div>
            )}
          </div>
        )}

        <Modal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setReportToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Report"
          message="Are you sure you want to delete this report? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminReports;