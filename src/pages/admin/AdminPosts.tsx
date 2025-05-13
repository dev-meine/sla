import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Database } from '../../types/supabase';

type NewsPost = Database['public']['Tables']['news_posts']['Row'];

const AdminPosts: React.FC = () => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  
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

  const onSubmit = async (data: NewsPost) => {
    try {
      setIsLoading(true);
      
      if (editingPost) {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('news_posts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Blog Posts</h2>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingPost(null);
              reset();
            }}
            className="btn btn-primary"
          >
            <PlusCircle size={20} className="mr-2" />
            Add Post
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">
              {editingPost ? 'Edit Post' : 'Add New Post'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select Category</option>
                    <option value="Competition">Competition</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Training">Training</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    {...register('author')}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    {...register('image_url')}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  {...register('excerpt')}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-md"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  {...register('content', { required: 'Content is required' })}
                  rows={10}
                  className="w-full px-3 py-2 border rounded-md"
                ></textarea>
                {errors.content && (
                  <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingPost(null);
                    reset();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPost ? 'Update' : 'Save'} Post
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
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="h-10 w-10 rounded mr-3 object-cover"
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.created_at || '').toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPosts;