import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Sun, Moon, GraduationCap, LayoutDashboard,
  ChevronDown, Search, Bookmark, GitCompareArrows, User, Shield
} from 'lucide-react';
import { useThemeStore } from '@/context/themeStore';
import { useAuthStore } from '@/context/authStore';
import { useCompareStore } from '@/context/compareStore';
import { useBookmarkStore } from '@/context/bookmarkStore';

const publicLinks = [
  { label: 'Home', path: '/' },
  { label: 'Search', path: '/search' },
];

const authLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Compare', path: '/compare' },
  { label: 'Find My College', path: '/questionnaire' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isDark, toggle } = useThemeStore();
  const { isAuthenticated, logout, user } = useAuthStore();
  const { colleges: compareList } = useCompareStore();
  const { bookmarkIds } = useBookmarkStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#060612]/95 backdrop-blur-xl shadow-[0_1px_40px_rgba(0,0,0,0.06)] border-b border-gray-200/60 dark:border-[#1c1c35]/80'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0" aria-label="CampusNavigator Home">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#6b5fff] to-[#a855f7] opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#6b5fff] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#6b5fff]/25">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-[17px] font-bold tracking-tight text-gray-900 dark:text-white hidden sm:block">
              Campus<span className="gradient-text">Navigator</span>
            </span>
          </Link>

          {/* ── Desktop nav links ─────────────────────────────── */}
          <div className="hidden md:flex items-center gap-0.5">
            {publicLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(link.path)
                    ? 'text-[#6b5fff] dark:text-[#a89fff] bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/6'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-[#6b5fff]"
                  />
                )}
              </Link>
            ))}

            {isAuthenticated && authLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(link.path)
                    ? 'text-[#6b5fff] dark:text-[#a89fff] bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/6'
                }`}
              >
                {link.label}
                {link.path === '/compare' && compareList.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#6b5fff] text-white text-[10px] flex items-center justify-center font-bold px-1">
                    {compareList.length}
                  </span>
                )}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-[#6b5fff]"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* ── Desktop right side ────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? 'dark' : 'light'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.18 }}
                >
                  {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                </motion.div>
              </AnimatePresence>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Bookmark quick-access */}
                <Link
                  to="/dashboard/bookmarks"
                  className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                  aria-label="Bookmarks"
                >
                  <Bookmark size={18} />
                  {bookmarkIds.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-[#6b5fff] text-white text-[9px] flex items-center justify-center font-bold px-0.5">
                      {bookmarkIds.length}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/6 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6b5fff] to-[#a855f7] flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 max-w-[80px] truncate">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#0e0e20] rounded-2xl shadow-2xl shadow-black/12 border border-gray-100 dark:border-[#1c1c35] overflow-hidden z-50"
                      >
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#1c1c35] bg-gradient-to-r from-[#6b5fff]/5 to-[#a855f7]/5">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                          {user?.role === 'admin' && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
                              <Shield size={10} /> Admin
                            </span>
                          )}
                        </div>
                        {/* Menu items */}
                        <div className="py-1.5">
                          {[
                            { icon: <LayoutDashboard size={15} />, label: 'Dashboard', path: '/dashboard' },
                            { icon: <Bookmark size={15} />, label: 'My Bookmarks', path: '/dashboard/bookmarks' },
                            { icon: <GitCompareArrows size={15} />, label: 'Compare', path: '/compare' },
                            { icon: <User size={15} />, label: 'Settings', path: '/dashboard/settings' },
                            ...(user?.role === 'admin' ? [{ icon: <Shield size={15} />, label: 'Admin Panel', path: '/admin' }] : []),
                          ].map(item => (
                            <button
                              key={item.path}
                              onClick={() => { navigate(item.path); setUserMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                              <span className="text-gray-400">{item.icon}</span>
                              {item.label}
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 dark:border-[#1c1c35] py-1.5">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 transition-colors"
                          >
                            <X size={15} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white shadow-md shadow-[#6b5fff]/25 hover:shadow-lg hover:shadow-[#6b5fff]/35 hover:-translate-y-px transition-all duration-200"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* ── Mobile right side ─────────────────────────────── */}
          <div className="md:hidden flex items-center gap-1.5">
            <button onClick={toggle} className="p-2 rounded-lg text-gray-500 dark:text-gray-400" aria-label="Toggle theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden border-t border-gray-200/60 dark:border-[#1c1c35]/80 bg-white/98 dark:bg-[#060612]/98 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-1">
              {/* User info (if logged in) */}
              {isAuthenticated && (
                <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-[#6b5fff]/6 dark:bg-[#6b5fff]/10 border border-[#6b5fff]/12">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6b5fff] to-[#a855f7] flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                </div>
              )}

              {/* Nav links */}
              {[...publicLinks, ...(isAuthenticated ? authLinks : [])].map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-[#6b5fff] dark:text-[#a89fff] bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/6'
                  }`}
                >
                  {link.label}
                  {link.path === '/compare' && compareList.length > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 rounded-full bg-[#6b5fff] text-white text-[10px] flex items-center justify-center font-bold">
                      {compareList.length}
                    </span>
                  )}
                </Link>
              ))}

              {/* Admin link */}
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/15 transition-colors"
                >
                  <Shield size={16} /> Admin Panel
                </Link>
              )}

              {/* Auth buttons */}
              <div className="pt-3 mt-2 border-t border-gray-100 dark:border-[#1c1c35] space-y-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/25 transition-colors"
                  >
                    <X size={16} /> Sign Out
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { navigate('/login'); setIsOpen(false); }}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1c1c35] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => { navigate('/register'); setIsOpen(false); }}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white shadow-lg shadow-[#6b5fff]/25 transition-all"
                    >
                      Get Started — Free
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </motion.nav>
  );
}
