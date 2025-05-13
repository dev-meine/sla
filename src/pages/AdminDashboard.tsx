import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  athletes: number;
  events: number;
  gallery: number;
  posts: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    athletes: 0,
    events: 0,
    gallery: 0,
    posts: 0
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        { count: athletesCount },
        { count: eventsCount },
        { count: galleryCount },
        { count: postsCount },
        { data: events },
        { data: posts }
      ] = await Promise.all([
        supabase.from('athletes').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('gallery_items').select('*', { count: 'exact', head: true }),
        supabase.from('news_posts').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*').order('date', { ascending: false }).limit(2),
        supabase.from('news_posts').select('*').order('created_at', { ascending: false }).limit(2)
      ]);

      setStats({
        athletes: athletesCount || 0,
        events: eventsCount || 0,
        gallery: galleryCount || 0,
        posts: postsCount || 0
      });

      setRecentEvents(events || []);
      setRecentPosts(posts || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Total Athletes</h3>
            <p className="text-3xl font-bold text-primary-600">{stats.athletes}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Active Events</h3>
            <p className="text-3xl font-bold text-secondary-500">{stats.events}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Gallery Items</h3>
            <p className="text-3xl font-bold text-accent-500">{stats.gallery}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Blog Posts</h3>
            <p className="text-3xl font-bold text-gray-600">{stats.posts}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
            <div className="space-y-4">
              {recentEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    new Date(event.date) > new Date() 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {new Date(event.date) > new Date() ? 'Upcoming' : 'Past'}
                  </span>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className="text-gray-500">No events found</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
            <div className="space-y-4">
              {recentPosts.map(post => (
                <div key={post.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/admin/posts'} 
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Edit
                  </button>
                </div>
              ))}
              {recentPosts.length === 0 && (
                <p className="text-gray-500">No posts found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;