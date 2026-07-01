/**
 * LandingPage — Professional world-class landing page
 * Accessible to all visitors (no login required)
 */
import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Search, Sparkles, BarChart3, BookOpen, Shield, ChevronRight,
  Zap, Target, TrendingUp, ChevronDown, GraduationCap, ArrowRight,
  CheckCircle, Star, Building2, MapPin, Users, Brain,
  GitCompareArrows
} from 'lucide-react';
import { CollegeCardSkeleton } from '@/components/loaders/Skeleton';
import { collegeService } from '@/services/api/collegeService';
import type { College } from '@/data/mockData';

function InView({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  { icon: <Sparkles />, title: 'AI-Powered Recommendations', desc: 'Personalized college matches using advanced AI analyzing 50+ data points tailored to your profile and goals.', color: 'from-violet-500 to-purple-600' },
  { icon: <Search />, title: 'Smart Search & Filters', desc: 'Powerful real-time search with voice input, stream filters, location, fees, NIRF ranking, and more.', color: 'from-blue-500 to-cyan-500' },
  { icon: <BarChart3 />, title: 'Side-by-Side Comparison', desc: 'Compare up to 4 colleges across fees, rankings, placements, facilities, and reviews in one view.', color: 'from-emerald-500 to-teal-500' },
  { icon: <BookOpen />, title: 'Detailed College Profiles', desc: 'Explore courses, authentic student reviews, placement records, and campus life for every college.', color: 'from-orange-500 to-amber-500' },
  { icon: <Target />, title: 'Personalized Dashboard', desc: 'Track bookmarked colleges, manage applications, set deadlines, and get AI-driven advice.', color: 'from-pink-500 to-rose-500' },
  { icon: <Shield />, title: 'Verified Student Reviews', desc: 'Only authentic reviews from verified alumni and current students — no fake ratings.', color: 'from-indigo-500 to-violet-500' },
];

const steps = [
  { step: '01', title: 'Tell Us About Yourself', desc: 'Answer a quick 3-minute questionnaire about your stream, budget, location, and career goals.', icon: <Target size={22} /> },
  { step: '02', title: 'AI Finds Your Matches', desc: 'Our Gemini AI engine cross-references your profile with 2,500+ colleges to find the best fits.', icon: <Brain size={22} /> },
  { step: '03', title: 'Explore & Compare', desc: 'Dive into detailed profiles, compare your shortlisted options, and read real student experiences.', icon: <GitCompareArrows size={22} /> },
  { step: '04', title: 'Apply With Confidence', desc: 'Save your favourites, track application deadlines, and submit — all from one dashboard.', icon: <CheckCircle size={22} /> },
];

const testimonials = [
  { name: 'Ananya Patel', role: 'IIT Delhi, B.Tech CSE', text: 'CampusNavigator\'s AI recommendations were spot on. I found my dream college in two days — it saved me weeks of research.', rating: 5, avatar: 'A', color: 'from-violet-500 to-purple-600' },
  { name: 'Rahul Krishnan', role: 'IIM Bangalore, MBA', text: 'The comparison tool is phenomenal. Comparing fees, placements, and rankings side by side made my decision so much easier.', rating: 5, avatar: 'R', color: 'from-blue-500 to-cyan-500' },
  { name: 'Priya Sharma', role: 'NID Ahmedabad, M.Des', text: 'The questionnaire nailed exactly what I was looking for in a design school. Highly recommend to every aspiring student!', rating: 5, avatar: 'P', color: 'from-emerald-500 to-teal-500' },
  { name: 'Arjun Verma', role: 'NLSIU Bangalore, BA LLB', text: 'Found detailed placement data and alumni reviews that I couldn\'t find anywhere else. The AI chat assistant is brilliant.', rating: 5, avatar: 'A', color: 'from-orange-500 to-amber-500' },
];

const faqs = [
  { q: 'Is CampusNavigator completely free?', a: 'Yes! CampusNavigator is 100% free for all students. We believe every student deserves access to quality college guidance regardless of background.' },
  { q: 'How accurate are the AI recommendations?', a: 'Our AI uses Google Gemini technology with 50+ data points per student profile. Students consistently report high satisfaction with recommendations that match their actual preferences.' },
  { q: 'Are the college reviews verified?', a: 'Absolutely. We verify all reviews via email confirmation and cross-reference with enrollment records to ensure authenticity. Fake reviews are automatically filtered.' },
  { q: 'Can I track multiple college applications?', a: 'Yes! Create a free account to bookmark colleges, set application deadlines, track document requirements, and get AI-powered shortlisting in your personalized dashboard.' },
  { q: 'Does it cover all types of colleges in India?', a: 'Yes — CampusNavigator includes IITs, NITs, IIITs, IIMs, AIIMS, NLUs, private universities, design schools, and 2,500+ other institutions across all streams and states.' },
];

const stats = [
  { end: 2500, suffix: '+', label: 'Colleges', icon: <Building2 size={20} /> },
  { end: 15000, suffix: '+', label: 'Students', icon: <Users size={20} /> },
  { end: 8000, suffix: '+', label: 'Reviews', icon: <Star size={20} /> },
  { end: 95, suffix: '%', label: 'Satisfaction', icon: <TrendingUp size={20} /> },
];

const topColleges = [
  { name: 'IIT Madras', rank: '#1 NIRF', stream: 'Engineering', img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&q=80' },
  { name: 'IIM Bangalore', rank: '#1 B-School', stream: 'Management', img: 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&q=80' },
  { name: 'AIIMS Delhi', rank: '#1 Medical', stream: 'Medicine', img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&q=80' },
  { name: 'NID Ahmedabad', rank: '#1 Design', stream: 'Design', img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80' },
  { name: 'NLSIU Bangalore', rank: '#1 Law', stream: 'Law', img: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=400&q=80' },
  { name: 'IISc Bangalore', rank: '#1 Research', stream: 'Science', img: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&q=80' },
];

// Animated counter
function Counter({ end, suffix }: { end: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * end));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<College[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    collegeService.getFeatured().then(data => {
      setFeatured(data.slice(0, 6));
      setFeaturedLoading(false);
    }).catch(() => setFeaturedLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#fafafa] dark:bg-[#060612]">
        {/* Gradient orbs */}
        <div className="glow-orb w-[600px] h-[600px] -top-32 -left-32 bg-[#6b5fff]/20" />
        <div className="glow-orb w-[500px] h-[500px] -bottom-24 -right-24 bg-[#a855f7]/15" />
        <div className="glow-orb w-[350px] h-[350px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#06b6d4]/10" />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-40 dark:opacity-20" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6b5fff]/10 dark:bg-[#6b5fff]/15 border border-[#6b5fff]/20 text-[#5b47f0] dark:text-[#a89fff] text-sm font-medium mb-8"
          >
            <Sparkles size={14} className="text-[#6b5fff]" />
            <span>India's #1 AI-Powered College Discovery Platform</span>
            <ChevronRight size={14} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white leading-[1.05] tracking-tight mb-6 font-display"
          >
            Find Your
            <br />
            <span className="gradient-text">Dream College</span>
            <br />
            <span className="text-gray-500 dark:text-gray-400 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold">with AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.6 }}
            className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Discover, compare, and choose from 2,500+ colleges across India with
            <span className="text-[#6b5fff] dark:text-[#a89fff] font-semibold"> AI-powered recommendations</span> personalised to your goals.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <button
              onClick={() => navigate('/register')}
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white font-semibold text-base shadow-xl shadow-[#6b5fff]/30 hover:shadow-2xl hover:shadow-[#6b5fff]/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Zap size={18} />
              Start Free — No Credit Card
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white dark:bg-white/8 text-gray-700 dark:text-gray-200 font-semibold text-base border border-gray-200 dark:border-white/12 hover:border-[#6b5fff]/40 hover:bg-[#6b5fff]/4 transition-all duration-200 shadow-sm"
            >
              <Search size={18} />
              Explore Colleges
            </button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400"
          >
            {['✓ Free forever', '✓ 2,500+ colleges', '✓ Verified reviews', '✓ AI-powered'].map((t, i) => (
              <span key={i} className="flex items-center gap-1">{t}</span>
            ))}
          </motion.div>
        </div>

        {/* Scroll arrow */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-300 dark:text-gray-600"
        >
          <ChevronDown size={28} />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* STATS */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white dark:bg-[#0e0e20] border-y border-gray-100 dark:border-[#1c1c35]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((s, i) => (
              <InView key={i} delay={i * 0.08} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#6b5fff]/10 dark:bg-[#6b5fff]/15 flex items-center justify-center text-[#6b5fff] mx-auto mb-3">
                  {s.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold gradient-text font-display">
                  <Counter end={s.end} suffix={s.suffix} />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
              </InView>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TOP INSTITUTIONS STRIP */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-14 bg-[#fafafa] dark:bg-[#060612]">
        <div className="max-w-7xl mx-auto px-4">
          <InView className="text-center mb-10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Featured Institutions</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              India's top colleges, all in one place
            </h2>
          </InView>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {topColleges.map((c, i) => (
              <InView key={i} delay={i * 0.07}>
                <Link to="/search" className="group block rounded-2xl overflow-hidden border border-gray-100 dark:border-[#1c1c35] bg-white dark:bg-[#0e0e20] hover:shadow-xl hover:shadow-[#6b5fff]/8 hover:-translate-y-1 transition-all duration-300">
                  <div className="h-24 overflow-hidden">
                    <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] font-semibold text-[#6b5fff] dark:text-[#a89fff] uppercase tracking-wide">{c.stream}</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 leading-tight line-clamp-1">{c.name}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{c.rank}</div>
                  </div>
                </Link>
              </InView>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/search" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6b5fff] dark:text-[#a89fff] hover:underline">
              View all 2,500+ colleges <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-[#0e0e20]">
        <div className="max-w-7xl mx-auto px-4">
          <InView className="text-center mb-16">
            <span className="section-badge mb-4 inline-flex">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mt-4 mb-4 font-display">
              Your college journey in<br /><span className="gradient-text">4 simple steps</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
              From preferences to perfect admission — guided every step of the way.
            </p>
          </InView>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#6b5fff]/30 to-transparent" />
            {steps.map((s, i) => (
              <InView key={i} delay={i * 0.12} className="relative text-center">
                <div className="relative w-20 h-20 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6b5fff]/15 to-[#a855f7]/10 rotate-3" />
                  <div className="relative w-20 h-20 rounded-2xl bg-white dark:bg-[#0e0e20] border-2 border-[#6b5fff]/20 flex items-center justify-center shadow-lg shadow-[#6b5fff]/10">
                    <span className="text-[#6b5fff]">{s.icon}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-[#6b5fff] to-[#8b5cf6] text-white text-[10px] font-black flex items-center justify-center shadow-md">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </InView>
            ))}
          </div>

          <InView className="text-center mt-14">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white font-semibold shadow-xl shadow-[#6b5fff]/25 hover:shadow-2xl hover:shadow-[#6b5fff]/35 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles size={18} /> Start My Journey <ArrowRight size={16} />
            </button>
          </InView>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FEATURED COLLEGES */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#fafafa] dark:bg-[#060612]">
        <div className="max-w-7xl mx-auto px-4">
          <InView className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="section-badge mb-3 inline-flex">Top Rated</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-3 font-display">
                Handpicked institutions
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Explore colleges with the best ratings and placement records</p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-[#6b5fff]/40 hover:text-[#6b5fff] transition-colors"
            >
              View All <ChevronRight size={15} />
            </button>
          </InView>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredLoading
              ? Array.from({ length: 6 }).map((_, i) => <CollegeCardSkeleton key={i} />)
              : featured.map((college, i) => (
                  <InView key={college.id} delay={i * 0.06}>
                    <Link to={`/college/${college.id}`} className="group block rounded-2xl overflow-hidden bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] hover:shadow-2xl hover:shadow-[#6b5fff]/8 hover:-translate-y-1 transition-all duration-300">
                      <div className="relative h-44 overflow-hidden">
                        <img src={college.image} alt={college.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-white text-xs font-semibold">{college.rating}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#6b5fff] transition-colors">{college.name}</h3>
                        <div className="flex items-center gap-1 mt-1.5 text-gray-400 text-xs">
                          <MapPin size={12} /> {college.city}, {college.state}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-[#1c1c35]">
                          <div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Fees from</div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">₹{(college.fees.min / 100000).toFixed(1)}L</div>
                          </div>
                          <span className="text-xs font-semibold text-[#6b5fff] group-hover:underline">View Details →</span>
                        </div>
                      </div>
                    </Link>
                  </InView>
                ))
            }
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FEATURES */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-[#0e0e20]">
        <div className="max-w-7xl mx-auto px-4">
          <InView className="text-center mb-16">
            <span className="section-badge mb-4 inline-flex">Features</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mt-4 mb-4 font-display">
              Everything you need to<br /><span className="gradient-text">make the right choice</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Powerful tools built specifically for Indian students navigating college admissions.
            </p>
          </InView>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <InView key={i} delay={i * 0.08}>
                <div className="group p-6 rounded-2xl bg-[#fafafa] dark:bg-[#060612] border border-gray-100 dark:border-[#1c1c35] hover:border-[#6b5fff]/25 hover:shadow-xl hover:shadow-[#6b5fff]/6 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <span className="w-6 h-6">{f.icon}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </InView>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TESTIMONIALS */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#fafafa] dark:bg-[#060612]">
        <div className="max-w-7xl mx-auto px-4">
          <InView className="text-center mb-16">
            <span className="section-badge mb-4 inline-flex">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mt-4 font-display">
              Real students, <span className="gradient-text">real results</span>
            </h2>
          </InView>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <InView key={i} delay={i * 0.1}>
                <div className={`relative p-5 rounded-2xl border transition-all duration-300 ${
                  activeTestimonial === i
                    ? 'bg-white dark:bg-[#0e0e20] border-[#6b5fff]/30 shadow-xl shadow-[#6b5fff]/8 scale-[1.02]'
                    : 'bg-white dark:bg-[#0e0e20] border-gray-100 dark:border-[#1c1c35]'
                }`}>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-[11px] text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </InView>
            ))}
          </div>
          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`rounded-full transition-all ${i === activeTestimonial ? 'w-6 h-2 bg-[#6b5fff]' : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-[#6b5fff]/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FAQ */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-[#0e0e20]">
        <div className="max-w-3xl mx-auto px-4">
          <InView className="text-center mb-14">
            <span className="section-badge mb-4 inline-flex">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4 font-display">
              Common questions
            </h2>
          </InView>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <InView key={i} delay={i * 0.06}>
                <div className={`rounded-2xl border overflow-hidden transition-all ${openFaq === i ? 'border-[#6b5fff]/30 shadow-lg shadow-[#6b5fff]/6' : 'border-gray-100 dark:border-[#1c1c35]'} bg-white dark:bg-[#0e0e20]`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white pr-4 text-sm md:text-base">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180 text-[#6b5fff]' : ''}`} />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-[#1c1c35] pt-4">{faq.a}</p>
                  </motion.div>
                </div>
              </InView>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FINAL CTA */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden bg-[#fafafa] dark:bg-[#060612]">
        <InView className="max-w-4xl mx-auto px-4 text-center">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#6b5fff] via-[#8b5cf6] to-[#06b6d4] p-12 md:p-16 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 dot-grid opacity-20" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-display">
                Your perfect college is<br />waiting for you
              </h2>
              <p className="text-white/75 text-lg mb-8 max-w-xl mx-auto">
                Join 15,000+ students who have already found their ideal institution using CampusNavigator.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#6b5fff] font-bold hover:bg-white/95 hover:-translate-y-0.5 transition-all shadow-xl"
                >
                  <Zap size={18} /> Create Free Account
                </button>
                <button
                  onClick={() => navigate('/search')}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all"
                >
                  Browse Colleges
                </button>
              </div>
            </div>
          </div>
        </InView>
      </section>
    </div>
  );
}
