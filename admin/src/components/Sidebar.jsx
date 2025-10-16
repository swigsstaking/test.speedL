import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  Search, 
  BookOpen, 
  FileText, 
  Image, 
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import Logo from './Logo';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { currentSite, sites, selectSite } = useSite();

  const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Sites', path: '/sites', icon: Globe, adminOnly: true },
    { name: 'SEO', path: '/seo', icon: Search },
    { name: 'Cours', path: '/courses', icon: BookOpen },
    { name: 'Contenu', path: '/content', icon: FileText },
    { name: 'Médias', path: '/media', icon: Image },
  ];

  const isActive = (path) => {
    return window.location.pathname === path;
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-dark-900 border-r border-dark-800">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-dark-800 px-4">
        <Logo />
      </div>

      {/* Site Selector */}
      {sites.length > 0 && (
        <div className="p-4 border-b border-dark-800">
          <label className="text-xs text-gray-400 mb-2 block">Site actuel</label>
          <select
            value={currentSite?._id || ''}
            onChange={(e) => {
              const site = sites.find(s => s._id === e.target.value);
              if (site) selectSite(site);
            }}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {sites.map((site) => (
              <option key={site._id} value={site._id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          // Hide admin-only items for non-admin users
          if (item.adminOnly && user?.role !== 'admin') return null;

          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-dark-800 hover:text-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
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
