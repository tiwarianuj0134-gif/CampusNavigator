import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bookmark, FileText, Sparkles, TrendingUp, Clock, Search, ArrowRight, Calendar, Bell } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import Badge from '@/components/common/Badge';
import { Skeleton } from '@/components/loaders/Skeleton';
import { dashboardService } from '@/services/api/dashboardService';
import { useAuthStore } from '@/context/authStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Filler, Legend);

const cardGradients = [
  'from-[#6b5fff] to-[#8b5cf6]',
  'from-blue-500 to-cyan-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
];

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardService.getStats(), dashboardService.getActivity(), dashboardService.getAnalytics()])
      .then(([s, a, an]) => { setStats(s); setActivity(a); setAnalytics(an); setLoading(false); });
  }, []);

  const profileCompletion = user?.preferences ? 80 : 40;

  const statCards = [
    { icon: <Bookmark className="w-5 h-5" />, label: 'Saved Colleges', value: stats?.bookmarks || 0, sub: '+3 this week', path: '/dashboard/bookmarks', gradient: cardGradients[0] },
    { icon: <FileText className="w-5 h-5" />, label: 'Applications', value: stats?.applications || 0, sub: '2 pending', path: '/dashboard/applications', gradient: cardGradients[1] },
    { icon: <Sparkles className="w-5 h-5" />, label: 'AI Matches', value: stats?.recommendations || 0, sub: 'Updated today', path: '/dashboard/recommendations', gradient: cardGradients[2] },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Explored', value: stats?.totalColleges || 0, sub: '+12 this month', path: '/search', gradient: cardGradients[3] },
  ];

  const chartData = {
    labels: analytics?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Activity',
      data: analytics?.views || [12, 19, 8, 15, 22, 10, 18],
      borderColor: '#6b5fff',
      backgroundColor: 'rgba(107, 95, 255, 0.08)',
      fill: true,
      tension: 0.45,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointBackgroundColor: '#6b5fff',
      borderWidth: 2.5,
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1f2937', titleFont: { size: 12 }, bodyFont: { size: 11 }, padding: 10, cornerRadius: 10 } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11 } } },
      y: { grid: { color: 'rgba(156,163,175,0.08)' }, ticks: { color: '#9ca3af', font: { size: 11 } } },
    },
    interaction: { intersect: false, mode: 'index' as const },
  };

  const doughnutData = {
    labels: ['Engineering', 'Medical', 'Business', 'Arts'],
    datasets: [{
      data: [45, 20, 25, 10],
      backgroundColor: ['#6b5fff', '#8b5cf6', '#06b6d4', '#f59e0b'],
      borderWidth: 0,
      cutout: '78%',
    }],
  };

  const deadlines = [
    { college: 'IIT Delhi', date: 'Dec 15, 2025', type: 'Application', urgent: true },
    { college: 'IIM Bangalore', date: 'Dec 20, 2025', type: 'Documents', urgent: false },
    { college: 'BITS Pilani', date: 'Jan 5, 2026', type: 'Application', urgent: false },
  ];

  return (
    <div className="space-y-7 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-display">
            Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Here's an overview of your college search journey</p>
        </div>
        <Link to="/search">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white text-sm font-semibold shadow-lg shadow-[#6b5fff]/25 hover:shadow-xl hover:shadow-[#6b5fff]/35 hover:-translate-y-px transition-all">
            <Search size={15} /> Explore Colleges
          </button>
        </Link>
      </div>

      {/* Profile completion */}
      {profileCompletion < 100 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-gradient-to-r from-[#6b5fff]/8 to-[#a855f7]/6 border border-[#6b5fff]/15 dark:border-[#6b5fff]/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg className="w-14 h-14 -rotate-90">
                  <circle cx="28" cy="28" r="23" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200 dark:text-gray-700" />
                  <circle cx="28" cy="28" r="23" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={`${(profileCompletion / 100) * 144.5} 144.5`} className="text-[#6b5fff]" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">{profileCompletion}%</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Complete your profile</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Add your preferences for better AI-powered college matches</p>
              </div>
            </div>
            <Link to="/dashboard/settings">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#6b5fff]/30 text-[#6b5fff] dark:text-[#a89fff] text-sm font-semibold hover:bg-[#6b5fff]/6 transition-colors">
                Complete Profile <ArrowRight size={14} />
              </button>
            </Link>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${profileCompletion}%` }} transition={{ delay: 0.3, duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-[#6b5fff] to-[#a855f7]" />
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
            <Skeleton className="w-10 h-10 rounded-xl mb-4" /><Skeleton className="w-16 h-7 mb-1.5" /><Skeleton className="w-24 h-3.5" />
          </div>
        )) : statCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={card.path} className="group block p-5 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] hover:shadow-xl hover:shadow-[#6b5fff]/6 hover:-translate-y-1 transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-4 shadow-md`}>{card.icon}</div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                <span className="text-[10px] font-medium text-emerald-500">{card.sub}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Weekly Activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Your college search engagement</p>
            </div>
            <Badge variant="success">+12%</Badge>
          </div>
          {loading ? <Skeleton className="h-56 w-full rounded-xl" /> : <div className="h-56"><Line data={chartData} options={chartOptions} /></div>}
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-5">Interest Breakdown</h3>
          {loading ? <Skeleton className="h-44 w-44 rounded-full mx-auto" /> : (
            <div className="h-44 flex items-center justify-center">
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', padding: 12, font: { size: 11 }, usePointStyle: true, pointStyleWidth: 8 } } } }} />
            </div>
          )}
        </div>
      </div>

      {/* Activity + Deadlines */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Activity</h3>
            <button className="text-xs text-[#6b5fff] font-medium hover:underline">View all</button>
          </div>
          {loading ? (
            <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3"><Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" /><div className="flex-1"><Skeleton className="h-4 w-full mb-1.5" /><Skeleton className="h-3 w-20" /></div></div>
            ))}</div>
          ) : (
            <div className="space-y-3">
              {activity.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 flex items-center justify-center text-[#6b5fff] flex-shrink-0">
                    <Clock size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{item.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Upcoming Deadlines</h3>
            <Bell size={16} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {deadlines.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#060612]">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} className={d.urgent ? 'text-red-500' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{d.college}</p>
                  <p className="text-xs text-gray-400">{d.type} deadline</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${d.urgent ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{d.date}</p>
                  {d.urgent && <Badge variant="danger" className="text-[10px] mt-0.5">Urgent</Badge>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 rounded-2xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-white text-base">Not sure where to start?</h3>
            <p className="text-white/70 text-sm mt-0.5">Let our AI questionnaire find your perfect college match in minutes.</p>
          </div>
          <Link to="/questionnaire" className="flex-shrink-0">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#6b5fff] font-semibold text-sm hover:bg-white/95 hover:-translate-y-px transition-all shadow-lg">
              <Sparkles size={15} /> Start AI Questionnaire
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
