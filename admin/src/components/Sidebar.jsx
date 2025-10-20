import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Search, BarChart3, Image, Settings, LogOut, ChevronDown, Mail, Users } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import Logo from './Logo';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { sites, currentSite, selectSite, loading } = useSite();
  const [showSiteSelector, setShowSiteSelector] = useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'Formations' },
    { to: '/seo', icon: Search, label: 'SEO' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/media', icon: Image, label: 'Médias' },
    { to: '/contacts', icon: Mail, label: 'Contacts' },
    { to: '/users', icon: Users, label: 'Utilisateurs', adminOnly: true },
    { to: '/settings', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-dark-900 border-r border-dark-800">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-dark-800 px-4">
        <Logo />
      </div>

      {/* Site Selector */}
      {!loading && sites.length > 0 && (
        <div className="p-4 border-b border-dark-800">
          <div className="relative">
            <button
              onClick={() => setShowSiteSelector(!showSiteSelector)}
              className="w-full flex items-center justify-between px-4 py-3 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                {currentSite?.logo?.url && (
                  <img src={currentSite.logo.url} alt={currentSite.logo.alt || currentSite.name} className="w-8 h-8 object-contain rounded" />
                )}
                <span className="text-sm font-medium text-gray-200 truncate">
                  {currentSite?.name || 'Sélectionner un site'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSiteSelector ? 'rotate-180' : ''}`} />
            </button>

            {showSiteSelector && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {sites.map((site) => (
                  <button
                    key={site._id}
                    onClick={() => {
                      selectSite(site);
                      setShowSiteSelector(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-dark-700 transition-colors ${
                      currentSite?._id === site._id ? 'bg-dark-700' : ''
                    }`}
                  >
                    {site.logo?.url && (
                      <img src={site.logo.url} alt={site.logo.alt || site.name} className="w-8 h-8 object-contain rounded" />
                    )}
                    <span className="text-sm text-gray-200 truncate">{site.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Masquer les items adminOnly si l'utilisateur n'est pas admin
          if (item.adminOnly && user?.role !== 'admin') {
            return null;
          }
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:bg-dark-800 hover:text-gray-200'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              {user?.name || 'Admin'}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
