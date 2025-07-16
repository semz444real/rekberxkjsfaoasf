import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useChat } from '../contexts/SupabaseChatContext';
import { TowerControl as GameController2, MessageCircle, User, Shield, Inbox, LogOut, Home } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const { getUnreadInvitesCount } = useChat();
  const location = useLocation();
  const unreadCount = getUnreadInvitesCount();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <GameController2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">RekberX</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {user && (
                <>
                  <Link
                    to="/"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span>Beranda</span>
                  </Link>

                  <Link
                    to="/chat"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/chat') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat</span>
                  </Link>

                  <Link
                    to="/inbox"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors relative ${
                      isActive('/inbox') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Inbox className="h-4 w-4" />
                    <span>Inbox</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  {isAdmin() && (
                    <Link
                      to="/admin"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        isActive('/admin') 
                          ? 'bg-red-100 text-red-700' 
                          : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <ConnectionStatus />
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/profile"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/profile') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.username}</span>
                  </Link>
                  
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="flex justify-around py-2">
              <Link
                to="/chat"
                className={`flex flex-col items-center py-2 px-3 ${
                  isActive('/chat') ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs mt-1">Chat</span>
              </Link>
              
              <Link
                to="/inbox"
                className={`flex flex-col items-center py-2 px-3 relative ${
                  isActive('/inbox') ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Inbox className="h-5 w-5" />
                <span className="text-xs mt-1">Inbox</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              
              <Link
                to="/profile"
                className={`flex flex-col items-center py-2 px-3 ${
                  isActive('/profile') ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <User className="h-5 w-5" />
                <span className="text-xs mt-1">Profil</span>
              </Link>
              
              {isAdmin() && (
                <Link
                  to="/admin"
                  className={`flex flex-col items-center py-2 px-3 ${
                    isActive('/admin') ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-xs mt-1">Admin</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;