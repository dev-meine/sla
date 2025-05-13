import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';
import ImageUpload from '../../components/ui/ImageUpload';

type TechnicalStaff = Database['public']['Tables']['technical_staff']['Row'];

const AdminTechnicalStaff: React.FC = () => {
  const [staff, setStaff] = useState<TechnicalStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingStaff, setEditingStaff] = useState<TechnicalStaff | null>(null);
  
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

  const onSubmit = async (data: TechnicalStaff) => {
    try {
      setIsLoading(true);
      
      if (editingStaff) {
        const { error } = await supabase
          .from('technical_staff')
          .update(data)
          .eq('id', editingStaff.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('technical_staff')
          .insert([data]);
          
        if (error) throw error;
      }

      reset();
      setIsAdding(false);
      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      console.error('Error saving technical staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (member: TechnicalStaff) => {
    setEditingStaff(member);
    setIsAdding(true);
    Object.keys(member).forEach((key) => {
      setValue(key as keyof TechnicalStaff, member[key as keyof TechnicalStaff]);
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('technical_staff')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Technical Staff</h2>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingStaff(null);
              reset();
            }}
            className="btn btn-primary"
          >
            <PlusCircle size={20} className="mr-2" />
            Add Staff Member
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  {...register('role', { required: 'Role is required' })}
                  className="w-full px-3 py-2 border rounded-md"
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
                  <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <select
                  {...register('specialization')}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Specialization</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Diving">Diving</option>
                  <option value="Water Polo">Water Polo</option>
                  <option value="Multiple">Multiple Disciplines</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                <ImageUpload
                  currentImage={editingStaff?.image}
                  onImageUpload={(url) => setValue('image', url)}
                  onImageRemove={() => setValue('image', '')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  {...register('start_date')}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                <textarea
                  {...register('qualifications')}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <textarea
                  {...register('experience')}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                ></textarea>
              </div>

              <div className="md:col-span-2 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingStaff(null);
                    reset();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStaff ? 'Update' : 'Save'} Staff Member
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-w-4 aspect-h-3">
                  <img
                    src={member.image || 'https://via.placeholder.com/400x300'}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  <p className="text-primary-600 text-sm">{member.role}</p>
                  {member.specialization && (
                    <p className="text-gray-500 text-sm">{member.specialization}</p>
                  )}
                  <div className="mt-4 space-y-2">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center text-sm text-gray-600 hover:text-primary-600"
                      >
                        <Mail size={14} className="mr-2" />
                        {member.email}
                      </a>
                    )}
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center text-sm text-gray-600 hover:text-primary-600"
                      >
                        <Phone size={14} className="mr-2" />
                        {member.phone}
                      </a>
                    )}
                  </div>
                  {member.bio && (
                    <p className="mt-3 text-gray-500 text-sm line-clamp-3">{member.bio}</p>
                  )}
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTechnicalStaff;