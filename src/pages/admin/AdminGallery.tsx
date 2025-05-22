import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
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
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<GalleryItem>();

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
        // If image has changed, delete old image and upload new one
        if (data.url !== editingItem.url && editingItem.url) {
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
      
      // Get item details to delete image
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

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Gallery</h2>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingItem(null);
              reset();
            }}
            className="btn btn-primary"
          >
            <PlusCircle size={20} className="mr-2" />
            Add Gallery Item
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">
              {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  {...register('type', { required: 'Type is required' })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Type</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media</label>
                {watch('type') === 'video' ? (
                  <input
                    type="url"
                    {...register('url', { required: 'URL is required' })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter video URL (e.g., YouTube embed URL)"
                  />
                ) : (
                  <ImageUpload
                    currentImage={editingItem?.url}
                    onImageUpload={async (file) => {
                      const url = await uploadImage(file);
                      if (url) setValue('url', url);
                    }}
                    onImageRemove={() => setValue('url', '')}
                  />
                )}
                {errors.url && (
                  <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md"
                ></textarea>
              </div>

              <div className="md:col-span-2 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingItem(null);
                    reset();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Save'} Gallery Item
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
            {galleryItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
                      }}
                    />
                  ) : (
                    <iframe
                      src={item.url}
                      title={item.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                  {item.description && (
                    <p className="text-gray-600 text-sm mt-2">{item.description}</p>
                  )}
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
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
            setItemToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Gallery Item"
          message="Are you sure you want to delete this gallery item? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminGallery;