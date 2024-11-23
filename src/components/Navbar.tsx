import React, { useState, useEffect } from 'react';
import { Menu, X, Church, UserCircle2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import { useTheme } from '../hooks/useTheme';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileDropdown && !(event.target as Element).closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Base navigation items
  const baseNavItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Sermons', path: '/sermons' },
  ];

  // Add Calendar for logged-in users who are not admins
  const navItems = user && user.role !== 'admin'
    ? [...baseNavItems, { name: 'Calendar', path: '/calendar' }]
    : baseNavItems;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Church className="h-8 w-8 text-blue-600 hover:text-blue-700 transition-colors" />
            <span className="ml-2 text-l font-bold text-gray-900 dark:text-white">
              Kalk Bay Community Church
            </span>
          </Link>
          
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-md"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="h-8 w-8 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-md"
                    />
                  ) : (
                    <UserCircle2 className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.displayName || 'User'}
                  </span>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleAuthClick('login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-md"
              >
                Sign Up / Login
              </button>
            )}
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                  isActive(item.path)
                    ? 'text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <button
                onClick={handleLogout}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => handleAuthClick('login')}
                className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors shadow-md"
              >
                Sign Up / Login
              </button>
            )}
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      )}
    </nav>
  );
};

export default Navbar;