import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';

type BoardMember = Database['public']['Tables']['board_members']['Row'];

const AdminBoard: React.FC = () => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BoardMember>();

  useEffect(() => {
    fetchBoardMembers();
  }, []);

  const fetchBoardMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('board_members')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setBoardMembers(data || []);
    } catch (error) {
      console.error('Error fetching board members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: BoardMember) => {
    try {
      setIsLoading(true);
      
      if (editingMember) {
        const { error } = await supabase
          .from('board_members')
          .update({
            name: data.name,
            position: data.position,
            image_url: data.image_url,
            bio: data.bio
          })
          .eq('id', editingMember.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('board_members')
          .insert([{
            name: data.name,
            position: data.position,
            image_url: data.image_url,
            bio: data.bio
          }]);
          
        if (error) throw error;
      }

      reset();
      setIsAdding(false);
      setEditingMember(null);
      fetchBoardMembers();
    } catch (error) {
      console.error('Error saving board member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (member: BoardMember) => {
    setEditingMember(member);
    setIsAdding(true);
    Object.keys(member).forEach((key) => {
      setValue(key as keyof BoardMember, member[key as keyof BoardMember]);
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this board member?')) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('board_members')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      fetchBoardMembers();
    } catch (error) {
      console.error('Error deleting board member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Board Members</h2>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingMember(null);
              reset();
            }}
            className="btn btn-primary"
          >
            <PlusCircle size={20} className="mr-2" />
            Add Board Member
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">
              {editingMember ? 'Edit Board Member' : 'Add New Board Member'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  {...register('position', { required: 'Position is required' })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.position && (
                  <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  {...register('image_url')}
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

              <div className="md:col-span-2 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingMember(null);
                    reset();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMember ? 'Update' : 'Save'} Board Member
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
            {boardMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-w-4 aspect-h-3">
                  <img
                    src={member.image_url || 'https://via.placeholder.com/400x300'}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  <p className="text-primary-600 text-sm">{member.position}</p>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-3">{member.bio}</p>
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

export default AdminBoard;