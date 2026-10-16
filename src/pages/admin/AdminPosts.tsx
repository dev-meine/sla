import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminBadge from '../../components/admin/AdminBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { supabase, invalidateCache } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Search, FileText, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';
import ImageCropUpload from '../../components/ui/ImageCropUpload';
import Modal from '../../components/ui/Modal';

type NewsPost = Database['public']['Tables']['news_posts']['Row'];

const AdminPosts: React.FC = () => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<NewsPost>();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('news_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `news/${fileName}`;

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
        .remove([`news/${path}`]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const onSubmit = async (data: NewsPost) => {
    try {
      setIsLoading(true);

      if (editingPost) {
        if (data.image_url !== editingPost.image_url && editingPost.image_url) {
          await deleteImage(editingPost.image_url);
        }

        const { error } = await supabase
          .from('news_posts')
          .update({
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            image_url: data.image_url,
            author: data.author,
            category: data.category
          })
          .eq('id', editingPost.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('news_posts')
          .insert([{
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            image_url: data.image_url,
            author: data.author,
            category: data.category
          }]);

        if (error) throw error;
      }

      reset();
      setIsAdding(false);
      setEditingPost(null);
      invalidateCache('news');
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (post: NewsPost) => {
    setEditingPost(post);
    setIsAdding(true);
    Object.keys(post).forEach((key) => {
      setValue(key as keyof NewsPost, post[key as keyof NewsPost]);
    });
  };

  const handleDeleteClick = (id: string) => {
    setPostToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      setIsLoading(true);
      const post = posts.find(p => p.id === postToDelete);
      if (post?.image_url) {
        await deleteImage(post.image_url);
      }

      const { error } = await supabase
        .from('news_posts')
        .delete()
        .eq('id', postToDelete);

      if (error) throw error;
      invalidateCache('news');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  const filteredPosts = posts.filter(post => {
    const q = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      (post.author && post.author.toLowerCase().includes(q)) ||
      (post.category && post.category.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Press & Media Posts"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'News Posts' }
        ]}
        actions={
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingPost(null);
              reset();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
          >
            {isAdding ? <X size={15} /> : <Plus size={15} />}
            <span>{isAdding ? 'Close Editor' : 'New Article'}</span>
          </button>
        }
      />

      {/* Editor Drawer / Form Card */}
      {isAdding && (
        <div className="admin-card p-6 mb-8 border-primary-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                {editingPost ? 'Edit Press Release' : 'Compose New Article'}
              </h3>
            </div>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingPost(null);
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
                  Article Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sierra Leone Swimmer Shines in 50m Freestyle"
                  {...register('title', { required: 'Title is required' })}
                  className="admin-input"
                />
                {errors.title && (
                  <p className="text-rose-600 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select {...register('category')} className="admin-select">
                  <option value="">Select Category</option>
                  <option value="Competition">Competition</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Training">Training</option>
                  <option value="Development">Development</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Author / Byline
                </label>
                <input
                  type="text"
                  placeholder="e.g. SLA Communications Team"
                  {...register('author')}
                  className="admin-input"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Featured Header Image (16:9)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Select what area of the image is shown as the article header
                  </span>
                </div>
                <ImageCropUpload
                  currentImage={editingPost?.image_url}
                  onImageUpload={async (file) => {
                    const url = await uploadImage(file);
                    if (url) setValue('image_url', url);
                  }}
                  onImageRemove={() => setValue('image_url', null)}
                  aspectRatio={16 / 9}
                  aspectRatioOptions={[
                    { label: '16:9 (Header)', value: 16 / 9 },
                    { label: '4:3 (Standard)', value: 4 / 3 },
                    { label: 'Free (Any Area)', value: undefined }
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Summary / Excerpt
              </label>
              <textarea
                {...register('excerpt')}
                rows={2}
                placeholder="Brief 1-2 sentence preview for search results and social cards..."
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Article Content (Markdown supported) *
              </label>
              <textarea
                {...register('content', { required: 'Content is required' })}
                rows={9}
                placeholder="Write the full press release here..."
                className="admin-input font-mono text-xs leading-relaxed"
              />
              {errors.content && (
                <p className="text-rose-600 text-xs mt-1">{errors.content.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingPost(null);
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
                {editingPost ? 'Save Changes' : 'Publish Article'}
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
              placeholder="Search by title, author, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-50 transition-all"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredPosts.length} of {posts.length} {posts.length === 1 ? 'article' : 'articles'}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
            <p className="mt-3 text-xs text-slate-500">Loading press releases...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              icon={FileText}
              title={searchQuery ? 'No matching articles' : 'No articles published yet'}
              description={
                searchQuery
                  ? `No news items match "${searchQuery}". Clear your search or create a new article.`
                  : 'Start communicating federation news, championship reports, and athlete profiles.'
              }
              action={
                !searchQuery && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={14} /> Compose First Article
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
                  <th className="px-5 py-3.5">Article</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Author</th>
                  <th className="px-4 py-3.5">Published Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {post.image_url ? (
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="h-10 w-14 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-14 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0 text-primary-600">
                            <FileText size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                            {post.title}
                          </p>
                          {post.excerpt && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <AdminBadge variant="info" size="sm">
                        {post.category || 'General'}
                      </AdminBadge>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                      {post.author || 'SLA Editorial'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Edit article"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(post.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete article"
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
          setPostToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Press Release"
        message="Are you sure you want to permanently remove this news post? This action will remove the article and its featured image from the public website."
        confirmText="Delete Post"
        cancelText="Cancel"
      />
    </AdminLayout>
  );
};

export default AdminPosts;