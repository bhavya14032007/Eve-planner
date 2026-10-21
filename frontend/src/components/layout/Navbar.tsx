import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Menu,
  X,
  Sun,
  Moon,
  Github,
  User as UserIcon,
  LogOut,
  Calendar,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Services', path: '/explore-services' },
    { name: 'Packages', path: '/packages' },
    { name: 'AI Planner', path: '/ai-planner' },
    { name: 'Register With Us', path: '/register-with-us' },
    { name: 'My Bookings', path: '/my-bookings' },
  ];

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight transition-transform hover:scale-[1.02]"
            aria-label="Eve Planner Home"
          >
            <div className="w-9 h-9 rounded-md bg-primary-subtle text-primary flex items-center justify-center border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-text-primary text-xl font-extrabold tracking-tight">
              Eve<span className="text-primary">Planner</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'text-primary bg-primary-subtle font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Theme Toggle, GitHub Link, Auth */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors border border-border"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-warning" />}
            </button>

            {/* Public GitHub Repository Link (User Rule) */}
            <a
              href="https://github.com/Bhavya-Roy/Eve-Planner"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors border border-border"
              aria-label="View Public GitHub Repository"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* User Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface-elevated hover:border-primary/50 transition-colors text-sm font-medium"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-text-primary max-w-[120px] truncate">{user.fullName}</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md bg-surface border border-border shadow-card py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs text-text-muted">Signed in as</p>
                      <p className="text-sm font-semibold text-text-primary truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded bg-primary-subtle text-primary">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                    >
                      <Calendar className="w-4 h-4 text-text-muted" />
                      My Bookings
                    </Link>

                    {user.role === 'VENDOR' && (
                      <Link
                        to="/vendor-dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                      >
                        <Briefcase className="w-4 h-4 text-text-muted" />
                        Vendor Dashboard
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-primary font-medium hover:bg-primary-subtle"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger-subtle text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-text-primary hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-md bg-primary hover:bg-primary-hover text-white shadow-subtle transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-text-muted border border-border"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-warning" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-text-primary border border-border"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-surface px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.path)
                  ? 'text-primary bg-primary-subtle font-bold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {user?.role === 'VENDOR' && (
            <Link
              to="/vendor-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary"
            >
              Vendor Dashboard
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-primary font-bold"
            >
              Admin Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-border flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-text-muted" />
                  <span className="text-sm font-semibold">{user.fullName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-danger font-medium hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-medium border border-border rounded-md text-text-primary"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-semibold bg-primary text-white rounded-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
