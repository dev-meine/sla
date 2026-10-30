import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {
  Bell,
  CheckCheck,
  ClipboardList,
  ShieldAlert,
  Calendar,
  FileText,
  Ship,
  ChevronRight,
  Loader2,
  X
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'registration' | 'report' | 'event' | 'news' | 'system';
  url: string;
  isRead: boolean;
  priority?: 'high' | 'normal';
}

interface AdminNotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

const STORAGE_KEY = 'sla_admin_read_notifications_v1';

const AdminNotificationsDropdown: React.FC<AdminNotificationsDropdownProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange
}) => {
  const { hasModule } = useAdminAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const canRegistrations = hasModule('registrations');
  const canReports = hasModule('reports');
  const canActivities = hasModule('activities');
  const canPosts = hasModule('posts');
  const canTravel = hasModule('travel');

  // Load read notification IDs from localStorage
  const getReadIds = (): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveReadIds = (ids: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      console.error('Error saving read notifications:', e);
    }
  };

  const fetchLiveNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const readIds = getReadIds();

      const [
        registrationsRes,
        reportsRes,
        eventsRes,
        newsRes
      ] = await Promise.all([
        canRegistrations
          ? supabase
              .from('swimming_registrations')
              .select('id, name, created_at, status')
              .eq('status', 'pending')
              .order('created_at', { ascending: false })
              .limit(5)
          : Promise.resolve({ data: null }),
        canReports
          ? supabase
              .from('anonymous_reports')
              .select('id, category, created_at, status')
              .eq('status', 'pending')
              .order('created_at', { ascending: false })
              .limit(5)
          : Promise.resolve({ data: null }),
        canActivities
          ? supabase
              .from('events')
              .select('id, title, date')
              .gte('date', new Date().toISOString().split('T')[0])
              .order('date', { ascending: true })
              .limit(3)
          : Promise.resolve({ data: null }),
        canPosts
          ? supabase
              .from('news_posts')
              .select('id, title, created_at')
              .order('created_at', { ascending: false })
              .limit(2)
          : Promise.resolve({ data: null })
      ]);

      const pendingRegistrations = registrationsRes.data;
      const pendingReports = reportsRes.data;
      const upcomingEvents = eventsRes.data;
      const recentNews = newsRes.data;

      const items: NotificationItem[] = [];

      // Pending registrations
      if (pendingRegistrations && pendingRegistrations.length > 0) {
        const regId = `reg-batch-${pendingRegistrations.length}-${pendingRegistrations[0].id}`;
        items.push({
          id: regId,
          title: 'Pending Swimming Registrations',
          description: `${pendingRegistrations.length} student applicant(s) awaiting tutor assignment and confirmation.`,
          timestamp: pendingRegistrations[0].created_at || new Date().toISOString(),
          category: 'registration',
          url: '/admin/registrations',
          isRead: readIds.includes(regId),
          priority: 'high'
        });
      }

      // Safe sport confidential reports
      if (pendingReports && pendingReports.length > 0) {
        const repId = `rep-batch-${pendingReports.length}-${pendingReports[0].id}`;
        items.push({
          id: repId,
          title: 'Safe Sport Incident Reports',
          description: `${pendingReports.length} confidential report(s) submitted requiring review.`,
          timestamp: pendingReports[0].created_at || new Date().toISOString(),
          category: 'report',
          url: '/admin/reports',
          isRead: readIds.includes(repId),
          priority: 'high'
        });
      }

      // Upcoming competitions
      if (upcomingEvents && upcomingEvents.length > 0) {
        upcomingEvents.forEach(ev => {
          items.push({
            id: `ev-${ev.id}`,
            title: `Upcoming Meet: ${ev.title}`,
            description: `Scheduled on the national aquatic calendar for ${ev.date ? new Date(ev.date).toLocaleDateString() : 'upcoming date'}.`,
            timestamp: ev.date || new Date().toISOString(),
            category: 'event',
            url: '/admin/activities',
            isRead: readIds.includes(`ev-${ev.id}`)
          });
        });
      }

      // Recent news updates
      if (recentNews && recentNews.length > 0) {
        recentNews.forEach(news => {
          items.push({
            id: `news-${news.id}`,
            title: `Published: ${news.title}`,
            description: 'Press release is live across public web portals and news feeds.',
            timestamp: news.created_at || new Date().toISOString(),
            category: 'news',
            url: '/admin/posts',
            isRead: readIds.includes(`news-${news.id}`)
          });
        });
      }

      // System Sea Coach operational status
      if (canTravel) {
        items.push({
          id: 'system-seacoach-live',
          title: 'Sea Coach Ferry Feed Active',
          description: 'Real-time timetable feed streaming for Aberdeen ⇄ Lungi delegation transfers.',
          timestamp: new Date().toISOString(),
          category: 'system',
          url: '/admin/travel',
          isRead: readIds.includes('system-seacoach-live')
        });
      }

      setNotifications(items);

      // Report unread count
      const unreadCount = items.filter(n => !n.isRead).length;
      if (onUnreadCountChange) {
        onUnreadCountChange(unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [canRegistrations, canReports, canActivities, canPosts, canTravel, onUnreadCountChange]);

  // Initial fetch and on permission change
  useEffect(() => {
    void fetchLiveNotifications();
  }, [fetchLiveNotifications]);

  useEffect(() => {
    if (isOpen) {
      void fetchLiveNotifications();
    }
  }, [isOpen, fetchLiveNotifications]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    saveReadIds(allIds);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (onUnreadCountChange) {
      onUnreadCountChange(0);
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    // Mark as read
    const readIds = getReadIds();
    if (!readIds.includes(item.id)) {
      const updated = [...readIds, item.id];
      saveReadIds(updated);
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
      const newUnread = notifications.filter(n => n.id !== item.id && !n.isRead).length;
      if (onUnreadCountChange) {
        onUnreadCountChange(newUnread);
      }
    }
    onClose();
    navigate(item.url);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'registration':
        return <ClipboardList size={15} className="text-blue-600" />;
      case 'report':
        return <ShieldAlert size={15} className="text-rose-600" />;
      case 'event':
        return <Calendar size={15} className="text-amber-600" />;
      case 'news':
        return <FileText size={15} className="text-emerald-600" />;
      default:
        return <Ship size={15} className="text-primary-600" />;
    }
  };

  const getCategoryPill = (category: string) => {
    switch (category) {
      case 'registration':
        return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'report':
        return 'bg-rose-50 border-rose-100 text-rose-700';
      case 'event':
        return 'bg-amber-50 border-amber-100 text-amber-700';
      case 'news':
        return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      default:
        return 'bg-primary-50 border-primary-100 text-primary-700';
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const footerDestination = canRegistrations
    ? '/admin/registrations'
    : canReports
    ? '/admin/reports'
    : '/admin';

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Popover Header */}
      <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-slate-700" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Notifications
          </h4>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-600 text-white">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 hover:underline px-2 py-1 rounded transition-colors"
              title="Mark all notifications as read"
            >
              <CheckCheck size={13} />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 size={20} className="animate-spin text-primary-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Checking system alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <CheckCheck size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-800">All caught up!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">No active notifications or pending reviews.</p>
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 relative ${
                !item.isRead ? 'bg-primary-50/20' : ''
              }`}
            >
              {/* Category Icon Squircle */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${getCategoryPill(item.category)}`}>
                {getCategoryIcon(item.category)}
              </div>

              {/* Text Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {item.title}
                  </span>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <span className="capitalize">{item.category}</span>
                  <span className="text-primary-600 font-medium hover:underline inline-flex items-center gap-0.5">
                    View details
                    <ChevronRight size={10} />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Popover Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
        <button
          onClick={() => {
            onClose();
            navigate(footerDestination);
          }}
          className="text-xs font-semibold text-primary-700 hover:text-primary-800 transition-colors w-full py-1"
        >
          {canRegistrations || canReports ? 'Review Pending Actions →' : 'Go to Dashboard →'}
        </button>
      </div>
    </div>
  );
};

export default AdminNotificationsDropdown;
