import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, UserCog, Search, X, Award, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';
import ImageUpload from '../../components/ui/ImageUpload';
import Modal from '../../components/ui/Modal';

type TechnicalStaff = Database['public']['Tables']['technical_staff']['Row'];

const AdminTechnicalStaff: React.FC = () => {
  const [staff, setStaff] = useState<TechnicalStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingStaff, setEditingStaff] = useState<TechnicalStaff | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TechnicalStaff>();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('technical_staff')
        .select('*')
        .order('name');

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching technical staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `staff/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const onSubmit = async (data: TechnicalStaff) => {
    try {
      setIsLoading(true);

      const staffData = {
        name: data.name,
        role: data.role,
        specialization: data.specialization,
        qualifications: data.qualifications,
        experience_years: data.experience_years ? Number(data.experience_years) : null,
        bio: data.bio,
        image: data.image
      };

      let result;
      if (editingStaff) {
        result = await supabase
          .from('technical_staff')
          .update(staffData)
          .eq('id', editingStaff.id);
      } else {
        result = await supabase
          .from('technical_staff')
          .insert([staffData]);
      }

      if (result.error) {
        throw result.error;
      }

      reset();
      setIsAdding(false);
      setEditingStaff(null);
      await fetchStaff();
    } catch (error) {
      console.error('Error saving technical staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (staffMember: TechnicalStaff) => {
    setEditingStaff(staffMember);
    setIsAdding(true);
    Object.keys(staffMember).forEach((key) => {
      setValue(key as keyof TechnicalStaff, staffMember[key as keyof TechnicalStaff]);
    });
  };

  const handleDeleteClick = (id: string) => {
    setStaffToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('technical_staff')
        .delete()
        .eq('id', staffToDelete);

      if (error) throw error;
      await fetchStaff();
    } catch (error) {
      console.error('Error deleting staff member:', error);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setStaffToDelete(null);
    }
  };

  const filteredStaff = staff.filter(member => {
    const q = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      (member.role && member.role.toLowerCase().includes(q)) ||
      (member.specialization && member.specialization.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Technical Staff & Coaches"
        description="Manage certified head coaches, technical directors, referees, and medical support personnel."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Athletic Roster' },
          { label: 'Technical Staff' }
        ]}
        actions={
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingStaff(null);
              reset();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
          >
            {isAdding ? <X size={15} /> : <Plus size={15} />}
            <span>{isAdding ? 'Close Editor' : 'Add Staff Member'}</span>
          </button>
        }
      />

      {/* Editor Drawer / Form Card */}
      {isAdding && (
        <div className="admin-card p-6 mb-8 border-primary-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                {editingStaff ? 'Update Staff Credentials' : 'Add Technical Staff Member'}
              </h3>
              <p className="text-xs text-slate-500">Register professional qualifications, coaching role, and sport specialization.</p>
            </div>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingStaff(null);
                reset();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mohamed Kamara"
                  {...register('name', { required: 'Name is required' })}
                  className="admin-input"
                />
                {errors.name && (
                  <p className="text-rose-600 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Technical Role *
                </label>
                <select
                  {...register('role', { required: 'Role is required' })}
                  className="admin-select"
                >
                  <option value="">Select Role</option>
                  <option value="Head Coach">Head Coach</option>
                  <option value="Assistant Coach">Assistant Coach</option>
                  <option value="Technical Director">Technical Director</option>
                  <option value="Physiotherapist">Physiotherapist</option>
                  <option value="Strength & Conditioning">Strength & Conditioning</option>
                  <option value="Team Manager">Team Manager</option>
                </select>
                {errors.role && (
                  <p className="text-rose-600 text-xs mt-1">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Specialization
                </label>
                <select {...register('specialization')} className="admin-select">
                  <option value="">Select Discipline</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Diving">Diving</option>
                  <option value="Water Polo">Water Polo</option>
                  <option value="Open Water">Open Water</option>
                  <option value="General Aquatics">General Aquatics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Qualifications & Certifications
                </label>
                <input
                  type="text"
                  placeholder="e.g. World Aquatics Level 2 Coach"
                  {...register('qualifications')}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="number"
                  placeholder="e.g. 8"
                  {...register('experience_years')}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Profile Photo
                </label>
                <ImageUpload
                  currentImage={editingStaff?.image}
                  onImageUpload={async (file) => {
                    const url = await uploadImage(file);
                    if (url) setValue('image', url);
                  }}
                  onImageRemove={() => setValue('image', null)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Biography & Coaching Achievements
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                placeholder="Coaching background, national squads led, and credentials..."
                className="admin-input text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingStaff(null);
                  reset();
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-xs"
              >
                {editingStaff ? 'Save Changes' : 'Register Staff'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Container Card */}
      <div className="admin-card overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, role, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50 transition-all"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredStaff.length} of {staff.length} staff {staff.length === 1 ? 'member' : 'members'}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
            <p className="mt-3 text-xs text-slate-500">Loading technical staff...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              icon={UserCog}
              title={searchQuery ? 'No matching staff members' : 'No technical staff registered'}
              description={
                searchQuery
                  ? `No staff match "${searchQuery}". Clear your search or add a member.`
                  : 'Register certified coaches and medical personnel supporting Sierra Leone Aquatics.'
              }
              action={
                !searchQuery && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={14} /> Add First Staff Member
                  </button>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Staff Member</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Specialization</th>
                  <th className="px-4 py-3.5">Credentials</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {filteredStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0 text-primary-600 font-bold text-xs">
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                            {member.name}
                          </p>
                          {member.bio && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {member.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <AdminBadge variant="info" size="sm">
                        {member.role}
                      </AdminBadge>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                      {member.specialization || 'Aquatics'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Award size={13} className="text-secondary-500 flex-shrink-0" />
                        <span>{member.qualifications || 'Certified Professional'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Edit member"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(member.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete member"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setStaffToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Member"
        message="Are you sure you want to remove this technical staff member from the roster? This action cannot be undone."
        confirmText="Delete Staff"
        cancelText="Cancel"
      />
    </AdminLayout>
  );
};

export default AdminTechnicalStaff;