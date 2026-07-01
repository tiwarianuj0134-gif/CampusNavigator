import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Bell, Shield, Moon, Sun, Save, Lock, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/context/authStore';
import { useThemeStore } from '@/context/themeStore';
import { toast } from 'sonner';

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#6b5fff]' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [notifications, setNotifications] = useState({ email: true, recommendations: true, updates: false, deadlines: true });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    toast.success('Settings saved successfully!');
  };

  const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]"
    >
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-[#1c1c35]">
        <div className="w-9 h-9 rounded-xl bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 flex items-center justify-center text-[#6b5fff]">{icon}</div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-display">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your account preferences and notifications</p>
      </div>

      {/* Profile */}
      <Section title="Profile Information" icon={<User size={17} />}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6b5fff] to-[#a855f7] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#6b5fff]/25 flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              {user?.role === 'admin' && <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-semibold"><Shield size={10} /> Admin</span>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-4 rounded-xl border border-gray-200 dark:border-[#1c1c35] bg-white dark:bg-[#060612] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5fff]/25 focus:border-[#6b5fff]/60 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
            <input type="email" value={email} disabled className="w-full h-10 px-4 rounded-xl border border-gray-200 dark:border-[#1c1c35] bg-gray-50 dark:bg-[#0e0e20] text-gray-500 dark:text-gray-500 text-sm cursor-not-allowed opacity-70" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed. Contact support if needed.</p>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={<Bell size={17} />}>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive email updates about your applications' },
            { key: 'recommendations', label: 'AI Recommendations', desc: 'Get notified when new college matches are found' },
            { key: 'deadlines', label: 'Deadline Reminders', desc: 'Alerts before application deadlines' },
            { key: 'updates', label: 'Product Updates', desc: 'News about CampusNavigator features' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{n.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.desc}</p>
              </div>
              <Toggle
                checked={notifications[n.key as keyof typeof notifications]}
                onChange={() => setNotifications(p => ({ ...p, [n.key]: !p[n.key as keyof typeof p] }))}
                label={n.label}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={isDark ? <Moon size={17} /> : <Sun size={17} />}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Toggle between light and dark theme</p>
          </div>
          <Toggle checked={isDark} onChange={toggle} label="Toggle dark mode" />
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" icon={<Shield size={17} />}>
        <div className="space-y-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-[#6b5fff]/40 hover:text-[#6b5fff] transition-all">
            <Lock size={15} /> Change Password
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-[#6b5fff]/40 hover:text-[#6b5fff] transition-all">
            <Shield size={15} /> Enable Two-Factor Authentication
          </button>
          <div className="pt-3 border-t border-gray-100 dark:border-[#1c1c35]">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 transition-all">
              <Trash2 size={15} /> Delete Account
            </button>
          </div>
        </div>
      </Section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white font-semibold text-sm shadow-lg shadow-[#6b5fff]/25 hover:shadow-xl hover:shadow-[#6b5fff]/35 hover:-translate-y-px transition-all disabled:opacity-60"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
