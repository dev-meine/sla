import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';
import ImageUpload from '../../components/ui/ImageUpload';
import Modal from '../../components/ui/Modal';

type BoardMember = Database['public']['Tables']['board_members']['Row'];

const AdminBoard: React.FC = () => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  
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

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `board-members/${fileName}`;

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

  const deleteImage = async (imageUrl: string) => {
    try {
      const path = imageUrl.split('/').pop();
      if (!path) return;

      const { error } = await supabase.storage
        .from('images')
        .remove([`board-members/${path}`]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const onSubmit = async (data: BoardMember) => {
    try {
      setIsLoading(true);
      
      if (editingMember) {
        // If image has changed, delete old image and upload new one
        if (data.image !== editingMember.image && editingMember.image) {
          await deleteImage(editingMember.image);
        }

        const { error } = await supabase
          .from('board_members')
          .update({
            name: data.name,
            position: data.position,
            image: data.image,
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
            image: data.image,
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

  const handleDeleteClick = (id: string) => {
    setMemberToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    
    try {
      setIsLoading(true);
      
      // Get member details to delete image
      const member = boardMembers.find(m => m.id === memberToDelete);
      if (member?.image) {
        await deleteImage(member.image);
      }

      const { error } = await supabase
        .from('board_members')
        .delete()
        .eq('id', memberToDelete);
        
      if (error) throw error;
      fetchBoardMembers();
    } catch (error) {
      console.error('Error deleting board member:', error);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setMemberToDelete(null);
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                <ImageUpload
                  currentImage={editingMember?.image}
                  onImageUpload={async (file) => {
                    const url = await uploadImage(file);
                    if (url) setValue('image', url);
                  }}
                  onImageRemove={() => setValue('image', null)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {boardMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={member.image || 'https://via.placeholder.com/400x300'}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x300';
                    }}
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
                      onClick={() => handleDeleteClick(member.id)}
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

        <Modal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setMemberToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Board Member"
          message="Are you sure you want to delete this board member? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminBoard;