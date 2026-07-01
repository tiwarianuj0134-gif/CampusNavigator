import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Users, MessageSquare, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Skeleton } from '@/components/loaders/Skeleton';
import Badge from '@/components/common/Badge';
import { adminService } from '@/services/api/adminService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [growth, setGrowth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([adminService.getStats(), adminService.getUserGrowth()]).then(([s, g]) => {
      setStats(s);
      setGrowth(g);
      setLoading(false);
    });
  }, []);

  const statCards = [
    { icon: <Building2 size={20} />, label: 'Total Colleges', value: stats?.totalColleges ?? '—', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: <Users size={20} />, label: 'Total Users', value: stats?.totalUsers ?? '—', color: 'from-[#6b5fff] to-[#8b5cf6]', bg: 'bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12' },
    { icon: <MessageSquare size={20} />, label: 'Total Reviews', value: stats?.totalReviews ?? '—', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { icon: <AlertCircle size={20} />, label: 'Pending Reviews', value: stats?.pendingReviews ?? '—', color: 'from-red-500 to-rose-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  const chartData = {
    labels: growth?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'New Users',
      data: growth?.data || [120, 180, 240, 300, 420, 380, 520],
      borderColor: '#6b5fff',
      backgroundColor: 'rgba(107,95,255,0.08)',
      fill: true,
      tension: 0.45,
      pointRadius: 0,
      pointHoverRadius: 5,
      borderWidth: 2.5,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1f2937', titleFont: { size: 12 }, bodyFont: { size: 11 }, padding: 10, cornerRadius: 10 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11 } } },
      y: { grid: { color: 'rgba(156,163,175,0.08)' }, ticks: { color: '#9ca3af', font: { size: 11 } } },
    },
    interaction: { intersect: false, mode: 'index' as const },
  };

  const recentActivity = [
    { type: 'review', message: 'New review submitted for IIT Delhi', time: '2 min ago', badge: <Badge variant="warning">Pending</Badge> },
    { type: 'college', message: 'NIT Warangal profile updated', time: '15 min ago', badge: <Badge variant="success">Updated</Badge> },
    { type: 'user', message: '5 new users registered today', time: '1 hour ago', badge: <Badge variant="info">Users</Badge> },
    { type: 'review', message: 'Review approved for IIM Bangalore', time: '2 hours ago', badge: <Badge variant="success">Approved</Badge> },
  ];

  return (
    <div className="space-y-7 max-w-7xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-display">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Platform-wide statistics and management overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
              <Skeleton className="w-10 h-10 rounded-xl mb-4" />
              <Skeleton className="w-16 h-7 mb-1.5" />
              <Skeleton className="w-24 h-3.5" />
            </div>
          ))
        ) : (
          statCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] hover:shadow-lg hover:shadow-[#6b5fff]/5 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                {card.icon}
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* Chart + Activity */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">User Growth</h3>
              <p className="text-xs text-gray-400 mt-0.5">New registrations over time</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <TrendingUp size={12} /> +18% this month
            </div>
          </div>
          {loading ? <Skeleton className="h-56 w-full rounded-xl" /> : (
            <div className="h-56">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-5">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 flex items-center justify-center text-[#6b5fff] flex-shrink-0 mt-0.5">
                  {item.type === 'review' ? <MessageSquare size={13} /> : item.type === 'college' ? <Building2 size={13} /> : <Users size={13} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{item.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-400">{item.time}</span>
                    {item.badge}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Review Queue', desc: `${stats?.pendingReviews ?? 0} awaiting moderation`, path: '/admin/reviews', color: 'bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800/40', icon: <MessageSquare size={18} className="text-amber-600 dark:text-amber-400" /> },
          { label: 'Manage Colleges', desc: `${stats?.totalColleges ?? 0} colleges listed`, path: '/admin/colleges', color: 'bg-blue-50 dark:bg-blue-900/15 border-blue-200 dark:border-blue-800/40', icon: <Building2 size={18} className="text-blue-600 dark:text-blue-400" /> },
          { label: 'User Analytics', desc: `${stats?.totalUsers ?? 0} registered users`, path: '/admin', color: 'bg-[#6b5fff]/6 dark:bg-[#6b5fff]/10 border-[#6b5fff]/20', icon: <Users size={18} className="text-[#6b5fff]" /> },
          { label: 'Platform Health', desc: 'All systems operational', path: '/admin', color: 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-800/40', icon: <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" /> },
        ].map((action, i) => (
          <Link
            key={i}
            to={action.path}
            className={`group p-4 rounded-2xl border ${action.color} hover:shadow-md hover:-translate-y-0.5 transition-all flex items-start gap-3`}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-3 w-full"
            >
              <div className="mt-0.5">{action.icon}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{action.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{action.desc}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
