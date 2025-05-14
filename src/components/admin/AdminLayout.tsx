import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Users, Calendar, Image, FileText, LogOut, Users2, Plane, UserCog, Home } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { label: 'Athletes', icon: <Users size={20} />, path: '/admin/athletes' },
    { label: 'Activities', icon: <Calendar size={20} />, path: '/admin/activities' },
    { label: 'Gallery', icon: <Image size={20} />, path: '/admin/gallery' },
    { label: 'Blog Posts', icon: <FileText size={20} />, path: '/admin/posts' },
    { label: 'Board Members', icon: <Users2 size={20} />, path: '/admin/board' },
    { label: 'Technical Staff', icon: <UserCog size={20} />, path: '/admin/technical-staff' },
    { label: 'Travel', icon: <Plane size={20} />, path: '/admin/travel' },
  ];

  const handleSignOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
      }
      navigate('/admin/login');
    } catch (error) {
      console.error('Sign out error:', error);
      // Still navigate to login even if there's an error
      navigate('/admin/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary-600">Admin</h1>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center px-6 py-3 ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
          <Link
            to="/"
            className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
          >
            <Home size={20} />
            <span className="ml-3">Return to Website</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={20} />
            <span className="ml-3">Sign Out</span>
          </button>
        </nav>
      </aside>

      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;