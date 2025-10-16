import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-screen w-64 bg-dark-900 border-r border-dark-800">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-dark-800 px-4">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <NavLink
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary-600 text-white"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </NavLink>
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
