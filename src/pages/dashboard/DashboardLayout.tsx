import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Bookmark, FileText, Sparkles, Settings,
  LogOut, Menu, X, ChevronRight, GraduationCap, Shield
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/context/authStore';

const navItems = [
  { icon: <LayoutDashboard size={17} />, label: 'Overview', path: '/dashboard', exact: true },
  { icon: <Bookmark size={17} />, label: 'Bookmarks', path: '/dashboard/bookmarks' },
  { icon: <FileText size={17} />, label: 'Applications', path: '/dashboard/applications' },
  { icon: <Sparkles size={17} />, label: 'Recommendations', path: '/dashboard/recommendations' },
  { icon: <Settings size={17} />, label: 'Settings', path: '/dashboard/settings' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen pt-16 bg-[#fafafa] dark:bg-[#060612]">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-[72px] left-4 z-40 md:hidden w-9 h-9 rounded-xl bg-white dark:bg-[#0e0e20] border border-gray-200 dark:border-[#1c1c35] shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-[#0e0e20] border-r border-gray-100 dark:border-[#1c1c35] z-30 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="flex flex-col h-full p-4 overflow-y-auto">
          {/* User info */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6b5fff]/8 to-[#a855f7]/6 dark:from-[#6b5fff]/12 dark:to-[#a855f7]/8 border border-[#6b5fff]/10 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6b5fff] to-[#a855f7] flex items-center justify-center text-white font-bold text-base shadow-md shadow-[#6b5fff]/25 flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            {user?.role === 'admin' && (
              <div className="mt-2.5">
                <button
                  onClick={() => { navigate('/admin'); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                >
                  <Shield size={12} /> Go to Admin Panel <ChevronRight size={12} className="ml-auto" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-[#6b5fff] text-white shadow-lg shadow-[#6b5fff]/25'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.label}
                <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
              </NavLink>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-[#1c1c35] space-y-1">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <GraduationCap size={17} /> Back to Home
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 transition-all"
            >
              <LogOut size={17} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64 p-5 md:p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Outlet />
        </motion.div>
      </main>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
