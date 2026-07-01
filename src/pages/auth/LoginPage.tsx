import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, GraduationCap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/context/authStore';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Invalid email or password.');
    }
  };

  /* ─── shared input styles ─── */
  const base =
    'w-full h-12 rounded-xl border border-gray-200 dark:border-[#1c1c35] ' +
    'bg-white dark:bg-[#0e0e20] text-gray-900 dark:text-white text-sm ' +
    'placeholder-gray-400 dark:placeholder-gray-500 ' +
    'focus:outline-none focus:ring-2 focus:ring-[#6b5fff]/25 focus:border-[#6b5fff]/60 ' +
    'transition-all';

  return (
    <div className="min-h-screen flex bg-[#fafafa] dark:bg-[#060612]">

      {/* ── Left decorative panel ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#6b5fff] via-[#8b5cf6] to-[#06b6d4] p-12 flex-col justify-between">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,rgba(255,255,255,.3) 1px,transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">CampusNavigator</span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white font-display mb-4 leading-tight">
            Your dream college<br />is one login away.
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Access AI recommendations, compare colleges, and track your applications.
          </p>
          <div className="space-y-3">
            {[
              'AI-powered college matching',
              'Side-by-side comparison',
              'Application deadline tracker',
              'Verified student reviews',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/85">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/50 text-sm">Trusted by 15,000+ students across India</p>
      </div>

      {/* ── Right form panel ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6b5fff] to-[#8b5cf6] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">CampusNavigator</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 font-display">
            Welcome back
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
            Sign in to continue your college discovery journey.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                {/* icon sits in its own fixed-width column — never touches text */}
                <span className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className={`${base} pl-11 pr-4`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-[#6b5fff] dark:text-[#a89fff] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className={`${base} pl-11 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#6b5fff]/25 hover:shadow-xl hover:shadow-[#6b5fff]/35 hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign In</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#6b5fff] dark:text-[#a89fff] font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
