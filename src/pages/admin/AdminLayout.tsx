import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Building2, MessageSquare, HelpCircle, Settings, LogOut, Menu, X, Shield, ChevronRight, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/context/authStore';

const navItems = [
  { icon: <LayoutDashboard size={17} />, label: 'Dashboard', path: '/admin', exact: true },
  { icon: <Building2 size={17} />, label: 'Colleges', path: '/admin/colleges' },
  { icon: <MessageSquare size={17} />, label: 'Reviews', path: '/admin/reviews' },
  { icon: <HelpCircle size={17} />, label: 'Questions', path: '/admin/questions' },
  { icon: <Settings size={17} />, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen pt-16 bg-[#fafafa] dark:bg-[#060612]">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-[72px] left-4 z-40 md:hidden w-9 h-9 rounded-xl bg-white dark:bg-[#0e0e20] border border-gray-200 dark:border-[#1c1c35] shadow-lg flex items-center justify-center"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-[#0e0e20] border-r border-gray-100 dark:border-[#1c1c35] z-30 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="flex flex-col h-full p-4">
          {/* Admin badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/8 to-orange-500/6 border border-amber-500/15 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/25">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">Admin Panel</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{user?.name}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
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
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.label}
                <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
              </NavLink>
            ))}
          </nav>

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-[#1c1c35] space-y-1">
            <Link to="/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
              <GraduationCap size={17} /> User Dashboard
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 transition-all">
              <LogOut size={17} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="md:ml-64 p-5 md:p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Outlet />
        </motion.div>
      </main>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
