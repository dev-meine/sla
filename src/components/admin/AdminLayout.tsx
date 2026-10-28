import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Image as ImageIcon,
  FileText,
  LogOut,
  Users2,
  Plane,
  UserCog,
  AlertTriangle,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import Logo from '../ui/Logo';
import AdminSearchModal from './AdminSearchModal';
import AdminNotificationsDropdown from './AdminNotificationsDropdown';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: {
    label: string;
    icon: React.ReactNode;
    path: string;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin' }
    ]
  },
  {
    label: 'Athletic Roster',
    items: [
      { label: 'Athletes', icon: <Users size={18} />, path: '/admin/athletes' },
      { label: 'Technical Staff', icon: <UserCog size={18} />, path: '/admin/technical-staff' },
      { label: 'Registrations', icon: <ClipboardList size={18} />, path: '/admin/registrations' }
    ]
  },
  {
    label: 'Content & Media',
    items: [
      { label: 'News Posts', icon: <FileText size={18} />, path: '/admin/posts' },
      { label: 'Activities', icon: <Calendar size={18} />, path: '/admin/activities' },
      { label: 'Gallery', icon: <ImageIcon size={18} />, path: '/admin/gallery' }
    ]
  },
  {
    label: 'Operations',
    items: [
      { label: 'Executive Board', icon: <Users2 size={18} />, path: '/admin/board' },
      { label: 'Travel & Ferry', icon: <Plane size={18} />, path: '/admin/travel' },
      { label: 'Reports', icon: <AlertTriangle size={18} />, path: '/admin/reports' }
    ]
  }
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    // Load session user email
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    fetchUser();
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
      }
      navigate('/admin/login');
    } catch (error) {
      console.error('Sign out error:', error);
      navigate('/admin/login');
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  // Derive current page name from active route
  const getCurrentPageTitle = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (isActive(item.path)) {
          return item.label;
        }
      }
    }
    return 'Admin';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Fixed Left (Desktop) & Sliding Drawer (Mobile) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        } ${
          isMobileOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80">
          <Link to="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
              <Logo size={22} className="text-primary-600" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-heading font-bold text-sm tracking-tight text-slate-900 leading-tight">
                  SLA Admin
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                  Management
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Grouped Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!isCollapsed ? (
                <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {group.label}
                </h4>
              ) : (
                <div className="h-px bg-slate-100 my-2 mx-2" />
              )}

              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2.5 gap-3'
                    } ${
                      active
                        ? 'bg-primary-50 text-primary-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 transition-colors ${
                        active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {item.icon}
                    </span>

                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {active && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary-600"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Bottom Footer Actions */}
        <div className="p-3 border-t border-slate-200/80 space-y-1 bg-slate-50/50">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            title={isCollapsed ? 'View Public Site' : undefined}
            className={`flex items-center rounded-lg text-xs font-medium text-slate-600 hover:bg-white hover:text-primary-600 hover:shadow-xs transition-all ${
              isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2 gap-2.5'
            }`}
          >
            <ExternalLink size={16} className="text-slate-400 flex-shrink-0" />
            {!isCollapsed && <span>View Public Site</span>}
          </Link>

          <button
            onClick={handleSignOut}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-all ${
              isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2 gap-2.5'
            }`}
          >
            <LogOut size={16} className="text-rose-500 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>

          {/* Desktop Rail Collapse Toggle */}
          <div className="hidden lg:block pt-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Wrapper with Top Bar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Modern Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile Toggle & Page Breadcrumb Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation drawer"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400 hidden sm:inline">Admin</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-sm font-semibold text-slate-900 font-heading">
                {getCurrentPageTitle()}
              </span>
            </div>
          </div>

          {/* Right: Search, Notifications & User Session Menu */}
          <div className="flex items-center gap-3">
            {/* Quick Search Cue (Desktop) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-100 rounded-lg text-xs text-slate-500 border border-slate-200/60 transition-colors cursor-pointer"
              title="Search admin platform (⌘K)"
            >
              <Search size={14} className="text-slate-400" />
              <span>Search platform...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 rounded text-slate-500 shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Quick Search Trigger (Mobile) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Search platform"
            >
              <Search size={18} />
            </button>

            {/* Notifications Bell with Popover Anchor */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                className={`relative p-2 rounded-lg transition-colors ${
                  isNotificationsOpen
                    ? 'bg-slate-100 text-primary-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
                aria-label="Notifications"
                title="Notifications & System Alerts"
              >
                <Bell size={18} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600 ring-2 ring-white" />
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Flyout */}
              <AdminNotificationsDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                onUnreadCountChange={setUnreadNotificationsCount}
              />
            </div>

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Administrator Profile Pill */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
                  {userEmail ? userEmail.split('@')[0] : 'Admin User'}
                </span>
                <span className="text-[10px] font-medium text-primary-600 flex items-center gap-1">
                  <ShieldCheck size={11} />
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Centered Main Canvas */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>

      {/* Global Command Palette / Search Modal */}
      <AdminSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default AdminLayout;