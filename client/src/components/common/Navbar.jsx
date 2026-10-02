import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationPanel from '../dashboard/NotificationPanel';
import { 
  Megaphone, 
  PlusCircle, 
  MapPin, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Layers, 
  CheckCircle2,
  Bell
} from 'lucide-react';

export default function Navbar() {
  const { user, profile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  CampusVoice
                  <span className="text-[10px] uppercase font-semibold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium -mt-0.5">
                  Transparency & Issue Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-slate-800 text-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/feed"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/feed')
                      ? 'bg-slate-800 text-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Campus Feed
                </Link>

                <Link
                  to="/map"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/map')
                      ? 'bg-slate-800 text-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Campus Map
                </Link>

                <Link
                  to="/transparency"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/transparency')
                      ? 'bg-slate-800 text-blue-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Transparency
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 ${
                      isActive('/admin') ? 'ring-2 ring-amber-400' : ''
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/feed"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Browse Reports
                </Link>
                <Link
                  to="/map"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Campus Map
                </Link>
                <Link
                  to="/transparency"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Transparency
                </Link>
              </>
            )}
          </div>

          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Report an Issue CTA */}
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  Report Issue
                </Link>

                {/* Notification Bell */}
                <NotificationPanel />

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 transition-colors border border-slate-700 focus:outline-none"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 text-white flex items-center justify-center text-xs font-bold border border-slate-600">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden lg:block pr-1">
                      <p className="text-xs font-medium text-white truncate max-w-[120px]">
                        {profile?.full_name || 'Student'}
                      </p>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {profile?.role || 'student'}
                      </p>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="text-sm font-semibold text-white truncate">{profile?.full_name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {profile?.student_id || profile?.role}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>

                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        Student Dashboard
                      </Link>

                      <div className="my-1 border-t border-slate-800" />

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                to="/report"
                className="p-2 rounded-lg bg-blue-600 text-white text-xs font-medium flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                Report
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          {user ? (
            <>
              <div className="px-3 py-2 rounded-lg bg-slate-800/80 mb-3 border border-slate-700/60">
                <p className="text-sm font-medium text-white">{profile?.full_name || 'Student'}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {profile?.student_id || profile?.role}
                  </span>
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Campus Feed
              </Link>
              <Link
                to="/map"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Campus Map
              </Link>
              <Link
                to="/transparency"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Transparency Stats
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-amber-400 hover:bg-amber-500/10 border border-amber-500/30"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Profile Settings
              </Link>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Browse Reports
              </Link>
              <Link
                to="/transparency"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Transparency Stats
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-800 text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
