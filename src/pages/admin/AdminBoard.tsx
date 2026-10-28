import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { supabase, invalidateCache } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Users2, Search, X, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';
import ImageCropUpload from '../../components/ui/ImageCropUpload';
import Modal from '../../components/ui/Modal';

type BoardMember = Database['public']['Tables']['board_members']['Row'];

const AdminBoard: React.FC = () => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      const filePath = `board/${fileName}`;

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
        .remove([`board/${path}`]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const onSubmit = async (data: BoardMember) => {
    try {
      setIsLoading(true);

      if (editingMember) {
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
      invalidateCache('board');
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
      const member = boardMembers.find(m => m.id === memberToDelete);
      if (member?.image) {
        await deleteImage(member.image);
      }

      const { error } = await supabase
        .from('board_members')
        .delete()
        .eq('id', memberToDelete);

      if (error) throw error;
      invalidateCache('board');
      fetchBoardMembers();
    } catch (error) {
      console.error('Error deleting board member:', error);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setMemberToDelete(null);
    }
  };

  const filteredMembers = boardMembers.filter(member => {
    const q = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      (member.position && member.position.toLowerCase().includes(q)) ||
      (member.bio && member.bio.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Executive Board"
        description="Manage the federation leadership team, positions, biographies, and executive profiles."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Operations' },
          { label: 'Executive Board' }
        ]}
        actions={
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingMember(null);
              reset();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
          >
            {isAdding ? <X size={15} /> : <Plus size={15} />}
            <span>{isAdding ? 'Close Editor' : 'Add Board Member'}</span>
          </button>
        }
      />

      {/* Editor Drawer / Form Card */}
      {isAdding && (
        <div className="admin-card p-6 mb-8 border-primary-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                {editingMember ? 'Update Board Member' : 'Appoint New Board Member'}
              </h3>
              <p className="text-xs text-slate-500">Provide executive credentials, position title, and professional profile photo.</p>
            </div>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingMember(null);
                reset();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. George Spilsbury"
                  {...register('name', { required: 'Name is required' })}
                  className="admin-input"
                />
                {errors.name && (
                  <p className="text-rose-600 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Position / Executive Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. President, Vice President, Secretary General"
                  {...register('position', { required: 'Position is required' })}
                  className="admin-input"
                />
                {errors.position && (
                  <p className="text-rose-600 text-xs mt-1">{errors.position.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Portrait Photo (Square 1:1)
                </label>
                <ImageCropUpload
                  currentImage={editingMember?.image}
                  onImageUpload={async (file) => {
                    const url = await uploadImage(file);
                    if (url) setValue('image', url);
                  }}
                  onImageRemove={() => setValue('image', null)}
                  aspectRatio={1}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Executive Biography & Vision
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                placeholder="Background, achievements in aquatic development, and governance role..."
                className="admin-input text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingMember(null);
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
                {editingMember ? 'Save Changes' : 'Appoint Member'}
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
              placeholder="Search by name, position, or biography..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50 transition-all"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredMembers.length} of {boardMembers.length} executive {boardMembers.length === 1 ? 'officer' : 'officers'}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
            <p className="mt-3 text-xs text-slate-500">Loading board members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              icon={Users2}
              title={searchQuery ? 'No matching board members' : 'No board members recorded'}
              description={
                searchQuery
                  ? `No board officers match "${searchQuery}". Clear your search or add a member.`
                  : 'Establish the executive governance directory for Sierra Leone Aquatics.'
              }
              action={
                !searchQuery && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={14} /> Add Board Member
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
                  <th className="px-5 py-3.5">Officer</th>
                  <th className="px-4 py-3.5">Executive Role</th>
                  <th className="px-4 py-3.5">Official Contact</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {filteredMembers.map((member) => (
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
                            className="h-11 w-11 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
                            }}
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0 text-primary-600 font-bold text-sm">
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                            {member.name}
                          </p>
                          {member.bio && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-md">
                              {member.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <AdminBadge variant="info" size="sm">
                        {member.position}
                      </AdminBadge>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Mail size={13} className="text-slate-400" />
                        {member.position.toLowerCase().replace(/[^a-z]/g, '')}@slsdwa.org
                      </span>
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
          setMemberToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Board Member"
        message="Are you sure you want to remove this executive officer from the official board directory? This action cannot be undone."
        confirmText="Delete Member"
        cancelText="Cancel"
      />
    </AdminLayout>
  );
};

export default AdminBoard;