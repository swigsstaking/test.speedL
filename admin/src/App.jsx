import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Courses = lazy(() => import('./pages/Courses'));
const SEO = lazy(() => import('./pages/SEO'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Media = lazy(() => import('./pages/Media'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-dark-950">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <SiteProvider>
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f3f4f6',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f3f4f6',
              },
            },
          }}
        />
        
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="courses" element={<Courses />} />
              <Route path="seo" element={<SEO />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="media" element={<Media />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </SiteProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
