import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { initSmoothScroll } from './utils/smoothScroll';

// Resilient dynamic chunk loader with automatic retry on network dropout
const lazyRetry = (componentImport: () => Promise<{ default: React.ComponentType<any> }>) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return await componentImport();
      } catch (retryError) {
        console.error('Failed to load page chunk:', retryError);
        throw retryError;
      }
    }
  });

// Public Routes (Lazy Loaded)
const HomePage = lazyRetry(() => import('./pages/HomePage'));
const AthletesPage = lazyRetry(() => import('./pages/AthletesPage'));
const BoardPage = lazyRetry(() => import('./pages/BoardPage'));
const ActivitiesPage = lazyRetry(() => import('./pages/ActivitiesPage'));
const GalleryPage = lazyRetry(() => import('./pages/GalleryPage'));
const NewsArticlePage = lazyRetry(() => import('./pages/NewsArticlePage'));
const AboutPage = lazyRetry(() => import('./pages/AboutPage'));
const ContactPage = lazyRetry(() => import('./pages/ContactPage'));
const NewsPage = lazyRetry(() => import('./pages/NewsPage'));
const RegistrationPage = lazyRetry(() => import('./pages/RegistrationPage'));

// Admin Routes (Lazy Loaded - Isolates heavy administrative dependencies)
const AdminLogin = lazyRetry(() => import('./pages/AdminLogin'));
const AdminDashboard = lazyRetry(() => import('./pages/AdminDashboard'));
const AdminAthletes = lazyRetry(() => import('./pages/admin/AdminAthletes'));
const AdminActivities = lazyRetry(() => import('./pages/admin/AdminActivities'));
const AdminGallery = lazyRetry(() => import('./pages/admin/AdminGallery'));
const AdminPosts = lazyRetry(() => import('./pages/admin/AdminPosts'));
const AdminBoard = lazyRetry(() => import('./pages/admin/AdminBoard'));
const AdminTravel = lazyRetry(() => import('./pages/admin/AdminTravel'));
const AdminTechnicalStaff = lazyRetry(() => import('./pages/admin/AdminTechnicalStaff'));
const AdminReports = lazyRetry(() => import('./pages/admin/AdminReports'));
const AdminRegistrations = lazyRetry(() => import('./pages/admin/AdminRegistrations'));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 bg-transparent">
    <div className="w-9 h-9 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-3"></div>
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
      Loading...
    </span>
  </div>
);

function App() {
  useEffect(() => {
    // Initialize smooth scrolling
    initSmoothScroll();
  }, []);

  return (
    <Router>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/athletes" element={<Layout><AthletesPage /></Layout>} />
          <Route path="/athletes/:id" element={<Layout><AthletesPage /></Layout>} />
          <Route path="/board" element={<Layout><BoardPage /></Layout>} />
          <Route path="/activities" element={<Layout><ActivitiesPage /></Layout>} />
          <Route path="/gallery" element={<Layout><GalleryPage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/news" element={<Layout><NewsPage /></Layout>} />
          <Route path="/news/:id" element={<Layout><NewsArticlePage /></Layout>} />
          <Route path="/register" element={<Layout><RegistrationPage /></Layout>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/athletes" element={
            <ProtectedRoute>
              <AdminAthletes />
            </ProtectedRoute>
          } />
          <Route path="/admin/activities" element={
            <ProtectedRoute>
              <AdminActivities />
            </ProtectedRoute>
          } />
          <Route path="/admin/gallery" element={
            <ProtectedRoute>
              <AdminGallery />
            </ProtectedRoute>
          } />
          <Route path="/admin/posts" element={
            <ProtectedRoute>
              <AdminPosts />
            </ProtectedRoute>
          } />
          <Route path="/admin/board" element={
            <ProtectedRoute>
              <AdminBoard />
            </ProtectedRoute>
          } />
          <Route path="/admin/travel" element={
            <ProtectedRoute>
              <AdminTravel />
            </ProtectedRoute>
          } />
          <Route path="/admin/technical-staff" element={
            <ProtectedRoute>
              <AdminTechnicalStaff />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute>
              <AdminReports />
            </ProtectedRoute>
          } />
          <Route path="/admin/registrations" element={
            <ProtectedRoute>
              <AdminRegistrations />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;