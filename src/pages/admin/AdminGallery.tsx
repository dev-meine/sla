import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Image as ImageIcon, Video, Search, X, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';
import ImageUpload from '../../components/ui/ImageUpload';
import Modal from '../../components/ui/Modal';

type GalleryItem = Database['public']['Tables']['gallery_items']['Row'];

const AdminGallery: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<GalleryItem>();
  const itemType = watch('type', 'image');

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

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
        .remove([`gallery/${path}`]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const onSubmit = async (data: GalleryItem) => {
    try {
      setIsLoading(true);

      if (editingItem) {
        if (editingItem.type === 'image' && data.type === 'image' && data.url !== editingItem.url) {
          await deleteImage(editingItem.url);
        }

        const { error } = await supabase
          .from('gallery_items')
          .update({
            title: data.title,
            type: data.type,
            url: data.url,
            description: data.description,
            date: data.date
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('gallery_items')
          .insert([{
            title: data.title,
            type: data.type,
            url: data.url,
            description: data.description,
            date: data.date
          }]);

        if (error) throw error;
      }

      reset();
      setIsAdding(false);
      setEditingItem(null);
      fetchGalleryItems();
    } catch (error) {
      console.error('Error saving gallery item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setIsAdding(true);
    Object.keys(item).forEach((key) => {
      setValue(key as keyof GalleryItem, item[key as keyof GalleryItem]);
    });
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setIsLoading(true);
      const item = galleryItems.find(i => i.id === itemToDelete);
      if (item?.type === 'image' && item.url) {
        await deleteImage(item.url);
      }

      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', itemToDelete);

      if (error) throw error;
      fetchGalleryItems();
    } catch (error) {
      console.error('Error deleting gallery item:', error);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Photo & Video Gallery"
        description="Curate high-resolution photography, tournament galleries, and video highlights."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Content & Media' },
          { label: 'Gallery' }
        ]}
        actions={
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingItem(null);
              reset();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
          >
            {isAdding ? <X size={15} /> : <Plus size={15} />}
            <span>{isAdding ? 'Close Editor' : 'Add Media'}</span>
          </button>
        }
      />

      {/* Editor Drawer / Form Card */}
      {isAdding && (
        <div className="admin-card p-6 mb-8 border-primary-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                {editingItem ? 'Edit Media Asset' : 'Upload New Gallery Item'}
              </h3>
              <p className="text-xs text-slate-500">Add photography or embed video highlights for public viewing.</p>
            </div>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingItem(null);
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
                  Title / Caption *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026 National Swimming Trials"
                  {...register('title', { required: 'Title is required' })}
                  className="admin-input"
                />
                {errors.title && (
                  <p className="text-rose-600 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Media Type *
                </label>
                <select
                  {...register('type', { required: 'Type is required' })}
                  className="admin-select"
                >
                  <option value="image">Photo / Image</option>
                  <option value="video">Embedded Video</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Capture Date *
                </label>
                <input
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                  className="admin-input"
                />
                {errors.date && (
                  <p className="text-rose-600 text-xs mt-1">{errors.date.message}</p>
                )}
              </div>

              <div className="md:col-span-3">
                {itemType === 'image' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Upload Photograph
                    </label>
                    <ImageUpload
                      currentImage={editingItem?.url}
                      onImageUpload={async (file) => {
                        const url = await uploadImage(file);
                        if (url) setValue('url', url);
                      }}
                      onImageRemove={() => setValue('url', '')}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Video Embed URL (YouTube/Vimeo Embed) *
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/embed/..."
                      {...register('url', { required: 'Video URL is required' })}
                      className="admin-input"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Description / Context
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Details on athletes captured, event location, and photographer credit..."
                className="admin-input text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingItem(null);
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
                {editingItem ? 'Save Changes' : 'Upload Asset'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-card p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search gallery by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50 transition-all"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              typeFilter === 'all'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            All Media
          </button>
          <button
            onClick={() => setTypeFilter('image')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              typeFilter === 'image'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <ImageIcon size={13} /> Photos
          </button>
          <button
            onClick={() => setTypeFilter('video')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              typeFilter === 'video'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Video size={13} /> Videos
          </button>
        </div>
      </div>

      {/* Gallery Cards Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-xs text-slate-500">Loading gallery media...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="admin-card p-8">
          <AdminEmptyState
            icon={ImageIcon}
            title={searchQuery || typeFilter !== 'all' ? 'No matching media' : 'Gallery is currently empty'}
            description={
              searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your search criteria or media filter.'
                : 'Upload championship photography, training reels, and event memories.'
            }
            action={
              !searchQuery && typeFilter === 'all' && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={14} /> Add First Photo
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="admin-card admin-card-hover overflow-hidden flex flex-col group"
            >
              {/* Media Asset Preview 16:9 */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
                    }}
                  />
                ) : (
                  <iframe
                    src={item.url}
                    title={item.title}
                    className="w-full h-full pointer-events-none"
                    allowFullScreen
                  />
                )}

                <div className="absolute top-2.5 left-2.5">
                  <AdminBadge variant={item.type === 'video' ? 'warning' : 'info'} size="sm">
                    {item.type === 'video' ? 'Video' : 'Photo'}
                  </AdminBadge>
                </div>
              </div>

              {/* Caption Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1 font-heading">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                    <Calendar size={12} />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    title="Edit item"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 size={15} />
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
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Media Asset"
        message="Are you sure you want to remove this item from the gallery? If this is an uploaded image, it will be deleted from storage."
        confirmText="Delete Media"
        cancelText="Cancel"
      />
    </AdminLayout>
  );
};

export default AdminGallery;