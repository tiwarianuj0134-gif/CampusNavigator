import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, GraduationCap, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/context/authStore';
import { toast } from 'sonner';

const perks = [
  'AI-powered college recommendations',
  'Save & compare up to 4 colleges',
  'Track application deadlines',
  'Verified reviews from real students',
  'Personalized admission guidance',
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars',  ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number',    ok: /\d/.test(password) },
  ];
  if (!password) return null;
  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-emerald-500'];
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? colors[score - 1] : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      <div className="flex gap-4">
        {checks.map((c, i) => (
          <span
            key={i}
            className={`flex items-center gap-1 text-[11px] transition-colors ${
              c.ok ? 'text-emerald-500' : 'text-gray-400'
            }`}
          >
            <CheckCircle size={10} className={c.ok ? 'fill-emerald-500' : ''} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed,   setAgreed]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6)          { toast.error('Password must be at least 6 characters'); return; }
    if (!agreed)                      { toast.error('Please accept the terms to continue'); return; }
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome to CampusNavigator 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed. Please try again.');
    }
  };

  /* shared input styles */
  const base =
    'w-full h-12 rounded-xl border border-gray-200 dark:border-[#1c1c35] ' +
    'bg-white dark:bg-[#0e0e20] text-gray-900 dark:text-white text-sm ' +
    'placeholder-gray-400 dark:placeholder-gray-500 ' +
    'focus:outline-none focus:ring-2 focus:ring-[#6b5fff]/25 focus:border-[#6b5fff]/60 ' +
    'transition-all';

  return (
    <div className="min-h-screen flex bg-[#fafafa] dark:bg-[#060612]">

      {/* ── Left decorative panel ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0e0e20] to-[#1a1a35] p-12 flex-col justify-between border-r border-[#1c1c35]">
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,rgba(107,95,255,.15) 1px,transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[#6b5fff]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-[#a855f7]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6b5fff] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#6b5fff]/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">CampusNavigator</span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white font-display mb-4 leading-tight">
            Start your college<br />
            <span className="gradient-text">discovery journey.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">Create a free account and unlock all features.</p>
          <div className="space-y-3">
            {perks.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6b5fff]/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={14} className="text-[#a89fff]" />
                </div>
                <span className="text-sm text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-gray-500 text-sm">Free forever. No credit card required.</p>
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
            Create your account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
            Free forever. No credit card required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ananya Patel"
                  autoComplete="name"
                  required
                  className={`${base} pl-11 pr-4`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
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
              <PasswordStrength password={password} />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <button
                type="button"
                role="checkbox"
                aria-checked={agreed}
                onClick={() => setAgreed(p => !p)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${
                  agreed
                    ? 'bg-[#6b5fff] border-[#6b5fff]'
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#6b5fff]/60'
                }`}
              >
                {agreed && <CheckCircle size={13} className="text-white" />}
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-[#6b5fff] hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#6b5fff] hover:underline font-medium">Privacy Policy</a>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#6b5fff]/25 hover:shadow-xl hover:shadow-[#6b5fff]/35 hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Create Free Account</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6b5fff] dark:text-[#a89fff] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
