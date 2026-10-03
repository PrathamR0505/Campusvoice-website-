import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Layers
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
    <nav className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-xl text-white font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 z-10">
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                  CampusVoice
                </span>
                <span className="font-sans text-xs text-zinc-400 font-medium tracking-wide">
                  Speak. Document. Demand.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links - Centered */}
          <div className="hidden md:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 font-sans z-10 shadow-sm">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/feed"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive('/feed')
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  Campus Feed
                </Link>

                <Link
                  to="/map"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/map')
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-zinc-300" />
                  Campus Map
                </Link>



                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 border border-zinc-700 bg-zinc-800 text-white ${
                      isActive('/admin') ? 'ring-1 ring-white' : ''
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/feed"
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                >
                  Browse Reports
                </Link>
                <Link
                  to="/map"
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                >
                  Campus Map
                </Link>

              </>
            )}
          </div>

          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center gap-3 font-sans z-10">
            {user ? (
              <>
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-200 transition-all shadow-sm"
                >
                  <PlusCircle className="w-4.5 h-4.5 text-zinc-950 stroke-[2.2]" />
                  Report Issue
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-3 p-1.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 transition-all border border-zinc-800 hover:border-zinc-700/80 focus:outline-none cursor-pointer"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-bold border border-zinc-700/80">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden lg:block pr-1">
                      <p className="text-xs font-bold text-white truncate max-w-[120px]">
                        {profile?.full_name || 'Student'}
                      </p>
                      <p className="text-[10px] text-zinc-400 capitalize font-medium">
                        {profile?.role || 'student'}
                      </p>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-[#121214] border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 font-sans"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-zinc-800/80">
                        <p className="text-sm font-bold text-white truncate">{profile?.full_name}</p>
                        <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700/80">
                          {profile?.student_id || profile?.role}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors font-semibold"
                      >
                        <User className="w-4 h-4 text-zinc-400" />
                        My Profile
                      </Link>

                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors font-semibold"
                      >
                        <Layers className="w-4 h-4 text-zinc-400" />
                        Student Dashboard
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors font-bold border-t border-b border-zinc-800/80 my-1 py-2.5"
                        >
                          <ShieldCheck className="w-4.5 h-4.5 text-amber-400" />
                          Admin Control Panel
                        </Link>
                      )}

                      <div className="my-1 border-t border-zinc-800/80" />

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-semibold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 font-sans">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4.5 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm"
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
                className="p-2 rounded-lg bg-white text-black text-xs font-semibold flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                Report
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#09090b] px-4 pt-3 pb-6 space-y-2 font-sans">
          {user ? (
            <>
              <div className="px-3 py-2 rounded-lg bg-zinc-900 mb-3 border border-zinc-800">
                <p className="text-sm font-bold text-white">{profile?.full_name || 'Student'}</p>
                <p className="text-xs text-zinc-400">{user.email}</p>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                Dashboard
              </Link>
              <Link
                to="/feed"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                Campus Feed
              </Link>
              <Link
                to="/map"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                Campus Map
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-semibold text-white bg-zinc-800 border border-zinc-700"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                Profile Settings
              </Link>

              <div className="pt-2 border-t border-zinc-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-base font-semibold text-red-400 hover:bg-red-500/10 flex items-center gap-2"
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
                className="block px-3 py-2 rounded-lg text-base font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                Browse Reports
              </Link>

              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-zinc-900 text-white border border-zinc-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-white text-black"
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

