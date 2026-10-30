import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import { AdminBadge } from '../components/admin/AdminBadge';
import { AdminEmptyState } from '../components/admin/AdminEmptyState';
import { supabase } from '../lib/supabase';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import {
  Users,
  Calendar,
  Image as ImageIcon,
  FileText,
  ArrowUpRight,
  Plus,
  Plane,
  ShieldAlert,
  Shield,
  ClipboardList,
  Users2,
  UserCog,
  Clock,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';

interface DashboardStats {
  athletes: number;
  events: number;
  gallery: number;
  posts: number;
}

interface RecentEventRow {
  id: string;
  title: string;
  date: string;
  category?: string | null;
}

interface RecentPostRow {
  id: string;
  title: string;
  category?: string | null;
  image_url?: string | null;
  created_at?: string | null;
}

const AdminDashboard: React.FC = () => {
  const { hasModule, isSuperAdmin } = useAdminAuth();

  const [stats, setStats] = useState<DashboardStats>({
    athletes: 0,
    events: 0,
    gallery: 0,
    posts: 0
  });
  const [recentEvents, setRecentEvents] = useState<RecentEventRow[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPostRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const canAthletes = hasModule('athletes');
  const canActivities = hasModule('activities');
  const canPosts = hasModule('posts');
  const canGallery = hasModule('gallery');

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
        supabase.from('events').select('*').order('date', { ascending: false }).limit(4),
        supabase.from('news_posts').select('*').order('created_at', { ascending: false }).limit(4)
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

  const quickShortcuts = useMemo(() => {
    const items: Array<{
      key: string;
      to: string;
      title: string;
      subtitle: string;
      icon: React.ReactNode;
      tone?: 'rose' | 'primary';
    }> = [];

    if (isSuperAdmin) {
      items.push({
        key: 'users',
        to: '/admin/users',
        title: 'Users & Roles',
        subtitle: 'Create accounts, roles & permissions',
        icon: <Shield size={18} />,
        tone: 'primary'
      });
    }
    if (hasModule('registrations')) {
      items.push({
        key: 'registrations',
        to: '/admin/registrations',
        title: 'Registrations',
        subtitle: 'Enrollments, packages & reschedules',
        icon: <ClipboardList size={18} />,
        tone: 'primary'
      });
    }
    if (hasModule('travel')) {
      items.push({
        key: 'travel',
        to: '/admin/travel',
        title: 'Travel & Ferry',
        subtitle: 'Sea Coach live schedules & hotels',
        icon: <Plane size={18} />,
        tone: 'primary'
      });
    }
    if (hasModule('board')) {
      items.push({
        key: 'board',
        to: '/admin/board',
        title: 'Executive Board',
        subtitle: 'Federation executive leadership',
        icon: <Users2 size={18} />,
        tone: 'primary'
      });
    }
    if (hasModule('technical_staff')) {
      items.push({
        key: 'technical_staff',
        to: '/admin/technical-staff',
        title: 'Technical Staff',
        subtitle: 'Coaches, referees & medical staff',
        icon: <UserCog size={18} />,
        tone: 'primary'
      });
    }
    if (hasModule('reports')) {
      items.push({
        key: 'reports',
        to: '/admin/reports',
        title: 'SafeSport Reports',
        subtitle: 'Confidential athlete feedback',
        icon: <ShieldAlert size={18} />,
        tone: 'rose'
      });
    }

    return items;
  }, [hasModule, isSuperAdmin]);

  const totalRecords = stats.athletes + stats.events + stats.gallery + stats.posts || 1;
  const athletesPct = Math.round((stats.athletes / totalRecords) * 100);
  const eventsPct = Math.round((stats.events / totalRecords) * 100);
  const postsPct = Math.round((stats.posts / totalRecords) * 100);
  const galleryPct = 100 - (athletesPct + eventsPct + postsPct);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="h-14 bg-slate-200/70 rounded-xl w-1/3" />

          {/* KPI Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200/60 rounded-xl" />
            ))}
          </div>

          {/* Split Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 bg-slate-200/60 rounded-xl" />
            <div className="h-80 bg-slate-200/60 rounded-xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  const athletesCardBody = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Athletes
          </p>
          <p className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            {stats.athletes}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <Users size={20} />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="inline-flex items-center text-accent-700 font-medium bg-accent-50 px-2 py-0.5 rounded-full border border-accent-200/50">
          <TrendingUp size={12} className="mr-1 text-accent-600" />
          Active Roster
        </span>
        {canAthletes && (
          <span className="text-slate-400 group-hover:text-primary-600 transition-colors inline-flex items-center">
            Manage <ChevronRight size={13} className="ml-0.5" />
          </span>
        )}
      </div>
    </>
  );

  const activitiesCardBody = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Active Events
          </p>
          <p className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            {stats.events}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-secondary-50 text-secondary-700 border border-secondary-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <Calendar size={20} />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="inline-flex items-center text-secondary-800 font-medium bg-secondary-50 px-2 py-0.5 rounded-full border border-secondary-200/60">
          <Clock size={12} className="mr-1 text-secondary-600" />
          Scheduled
        </span>
        {canActivities && (
          <span className="text-slate-400 group-hover:text-primary-600 transition-colors inline-flex items-center">
            Calendar <ChevronRight size={13} className="ml-0.5" />
          </span>
        )}
      </div>
    </>
  );

  const postsCardBody = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Press Releases
          </p>
          <p className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            {stats.posts}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-accent-50 text-accent-700 border border-accent-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <FileText size={20} />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="inline-flex items-center text-primary-700 font-medium bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200/50">
          <Activity size={12} className="mr-1 text-primary-600" />
          Published
        </span>
        {canPosts && (
          <span className="text-slate-400 group-hover:text-primary-600 transition-colors inline-flex items-center">
            Articles <ChevronRight size={13} className="ml-0.5" />
          </span>
        )}
      </div>
    </>
  );

  const galleryCardBody = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Gallery Media
          </p>
          <p className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            {stats.gallery}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <ImageIcon size={20} />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="inline-flex items-center text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          Media Library
        </span>
        {canGallery && (
          <span className="text-slate-400 group-hover:text-primary-600 transition-colors inline-flex items-center">
            Photos <ChevronRight size={13} className="ml-0.5" />
          </span>
        )}
      </div>
    </>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
                Federation Overview
              </h1>
              <AdminBadge variant="success" size="sm">
                System Live
              </AdminBadge>
            </div>
            <p className="text-sm text-slate-600">
              Real-time monitoring of Sierra Leone Aquatics athletes, activities, press releases, and operations.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          {(canPosts || canAthletes || isSuperAdmin) && (
            <div className="flex flex-wrap items-center gap-3">
              {isSuperAdmin && (
                <Link
                  to="/admin/users"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
                >
                  <Shield size={14} className="text-primary-600" />
                  <span>Users & Roles</span>
                </Link>
              )}
              {canPosts && (
                <Link
                  to="/admin/posts"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
                >
                  <Plus size={14} className="text-slate-500" />
                  <span>New Article</span>
                </Link>
              )}
              {canAthletes && (
                <Link
                  to="/admin/athletes"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
                >
                  <Plus size={14} />
                  <span>Add Athlete</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 4 Stat KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {canAthletes ? (
            <Link
              to="/admin/athletes"
              className="admin-card admin-card-hover p-5 flex flex-col justify-between group cursor-pointer"
            >
              {athletesCardBody}
            </Link>
          ) : (
            <div className="admin-card p-5 flex flex-col justify-between">{athletesCardBody}</div>
          )}

          {canActivities ? (
            <Link
              to="/admin/activities"
              className="admin-card admin-card-hover p-5 flex flex-col justify-between group cursor-pointer"
            >
              {activitiesCardBody}
            </Link>
          ) : (
            <div className="admin-card p-5 flex flex-col justify-between">{activitiesCardBody}</div>
          )}

          {canPosts ? (
            <Link
              to="/admin/posts"
              className="admin-card admin-card-hover p-5 flex flex-col justify-between group cursor-pointer"
            >
              {postsCardBody}
            </Link>
          ) : (
            <div className="admin-card p-5 flex flex-col justify-between">{postsCardBody}</div>
          )}

          {canGallery ? (
            <Link
              to="/admin/gallery"
              className="admin-card admin-card-hover p-5 flex flex-col justify-between group cursor-pointer"
            >
              {galleryCardBody}
            </Link>
          ) : (
            <div className="admin-card p-5 flex flex-col justify-between">{galleryCardBody}</div>
          )}
        </div>

        {/* Platform Content Distribution Bar (Visual Chart using Site Palette) */}
        <div className="admin-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Platform Resource Distribution
              </h2>
              <p className="text-xs text-slate-500">
                Current allocation across national competitors, programs, press releases, and media archives.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
              {stats.athletes + stats.events + stats.posts + stats.gallery} Total Entities
            </span>
          </div>

          {/* Multi-segment progress bar */}
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${athletesPct}%` }}
              className="bg-primary-600 transition-all duration-500"
              title={`Athletes: ${athletesPct}%`}
            />
            <div
              style={{ width: `${eventsPct}%` }}
              className="bg-secondary-500 transition-all duration-500"
              title={`Events: ${eventsPct}%`}
            />
            <div
              style={{ width: `${postsPct}%` }}
              className="bg-accent-500 transition-all duration-500"
              title={`Articles: ${postsPct}%`}
            />
            <div
              style={{ width: `${Math.max(galleryPct, 2)}%` }}
              className="bg-slate-400 transition-all duration-500"
              title={`Gallery: ${galleryPct}%`}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary-600 flex-shrink-0" />
              <span className="text-xs text-slate-600 font-medium">Athletes ({stats.athletes})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary-500 flex-shrink-0" />
              <span className="text-xs text-slate-600 font-medium">Events ({stats.events})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent-500 flex-shrink-0" />
              <span className="text-xs text-slate-600 font-medium">News Posts ({stats.posts})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-600 font-medium">Gallery Media ({stats.gallery})</span>
            </div>
          </div>
        </div>

        {/* Split Grid: Recent Events & Recent Press Releases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Events Card */}
          <div className="admin-card flex flex-col">
            <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Activities & Competitions
                </h3>
                <p className="text-xs text-slate-500">Upcoming tournaments and training clinics</p>
              </div>
              {canActivities && (
                <Link
                  to="/admin/activities"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View all <ArrowUpRight size={14} />
                </Link>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col divide-y divide-slate-100">
              {recentEvents.length === 0 ? (
                <AdminEmptyState
                  icon={Calendar}
                  title="No activities recorded"
                  description="Add upcoming swimming meets, coaching clinics, or championships."
                  action={
                    canActivities ? (
                      <Link
                        to="/admin/activities"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        <Plus size={14} /> Log Event
                      </Link>
                    ) : undefined
                  }
                />
              ) : (
                recentEvents.map((event) => {
                  const isUpcoming = new Date(event.date) >= new Date();
                  return (
                    <div
                      key={event.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold uppercase text-slate-500 leading-none">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-sm font-bold text-slate-900 leading-none mt-0.5">
                            {new Date(event.date).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                            {event.title}
                          </p>
                          <p className="text-xs text-slate-500 capitalize truncate">
                            {event.category?.replace('-', ' ') || 'General Program'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <AdminBadge variant={isUpcoming ? 'success' : 'neutral'} size="sm">
                          {isUpcoming ? 'Upcoming' : 'Concluded'}
                        </AdminBadge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Press Releases Card */}
          <div className="admin-card flex flex-col">
            <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Latest Press Releases
                </h3>
                <p className="text-xs text-slate-500">Official federation announcements and news</p>
              </div>
              {canPosts && (
                <Link
                  to="/admin/posts"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View all <ArrowUpRight size={14} />
                </Link>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col divide-y divide-slate-100">
              {recentPosts.length === 0 ? (
                <AdminEmptyState
                  icon={FileText}
                  title="No press releases published"
                  description="Draft and publish news stories, athlete highlights, and federation announcements."
                  action={
                    canPosts ? (
                      <Link
                        to="/admin/posts"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        <Plus size={14} /> Create Post
                      </Link>
                    ) : undefined
                  }
                />
              ) : (
                recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0 text-primary-600">
                          <FileText size={18} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="font-medium text-slate-500">
                            {post.category || 'Announcement'}
                          </span>
                          <span>•</span>
                          <span>
                            {post.created_at
                              ? new Date(post.created_at).toLocaleDateString()
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {canPosts && (
                      <Link
                        to="/admin/posts"
                        className="text-xs font-semibold text-slate-500 hover:text-primary-600 px-2.5 py-1 rounded-md border border-slate-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all flex-shrink-0"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Operational Quick Nav Grid */}
        {quickShortcuts.length > 0 && (
          <div className="admin-card p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Operations & Administration Shortcuts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickShortcuts.map((shortcut) => (
                <Link
                  key={shortcut.key}
                  to={shortcut.to}
                  className={`p-4 rounded-xl border border-slate-200/80 transition-all flex items-start gap-3 group ${
                    shortcut.tone === 'rose'
                      ? 'hover:border-rose-300 hover:bg-rose-50/30'
                      : 'hover:border-primary-300 hover:bg-primary-50/30'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      shortcut.tone === 'rose'
                        ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
                        : 'bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white'
                    }`}
                  >
                    {shortcut.icon}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold text-slate-900 transition-colors ${
                        shortcut.tone === 'rose'
                          ? 'group-hover:text-rose-600'
                          : 'group-hover:text-primary-600'
                      }`}
                    >
                      {shortcut.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{shortcut.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
