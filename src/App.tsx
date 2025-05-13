import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AthletesPage from './pages/AthletesPage';
import BoardPage from './pages/BoardPage';
import ActivitiesPage from './pages/ActivitiesPage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminAthletes from './pages/admin/AdminAthletes';
import AdminActivities from './pages/admin/AdminActivities';
import AdminGallery from './pages/admin/AdminGallery';
import AdminPosts from './pages/admin/AdminPosts';
import AdminBoard from './pages/admin/AdminBoard';
import AdminTravel from './pages/admin/AdminTravel';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/athletes" element={<Layout><AthletesPage /></Layout>} />
        <Route path="/board" element={<Layout><BoardPage /></Layout>} />
        <Route path="/activities" element={<Layout><ActivitiesPage /></Layout>} />
        <Route path="/gallery" element={<Layout><GalleryPage /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        
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
      </Routes>
    </Router>
  );
}

export default App;