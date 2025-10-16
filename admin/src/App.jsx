import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import SEO from './pages/SEO';

// Placeholder pages
const Sites = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-100 mb-4">Gestion des sites</h1>
    <div className="card p-6">
      <p className="text-gray-400">Page en construction...</p>
    </div>
  </div>
);

const Content = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-100 mb-4">Gestion du contenu</h1>
    <div className="card p-6">
      <p className="text-gray-400">Page en construction...</p>
    </div>
  </div>
);

const Media = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-gray-100 mb-4">Gestion des médias</h1>
    <div className="card p-6">
      <p className="text-gray-400">Page en construction...</p>
    </div>
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
              <Route path="sites" element={<Sites />} />
              <Route path="seo" element={<SEO />} />
              <Route path="courses" element={<Courses />} />
              <Route path="content" element={<Content />} />
              <Route path="media" element={<Media />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SiteProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
