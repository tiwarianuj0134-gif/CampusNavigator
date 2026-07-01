import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, GitCompareArrows, Star, MapPin, TrendingUp, DollarSign, Award, Search, Lock, ArrowRight } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import { useCompareStore } from '@/context/compareStore';
import { useAuthStore } from '@/context/authStore';

export default function ComparePage() {
  const navigate = useNavigate();
  const { colleges, removeCollege, clearAll } = useCompareStore();
  const { isAuthenticated } = useAuthStore();

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-[#fafafa] dark:bg-[#060612] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 flex items-center justify-center mx-auto mb-6 border border-[#6b5fff]/12">
            <Lock className="w-9 h-9 text-[#6b5fff]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 font-display">Sign in to compare</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Create a free account to compare up to 4 colleges side by side — fees, rankings, placements, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/register')} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white font-semibold shadow-lg shadow-[#6b5fff]/25 hover:-translate-y-px transition-all">
              Create Free Account <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/login')} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Sign In
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (colleges.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[#fafafa] dark:bg-[#060612]">
        <div className="max-w-4xl mx-auto px-4">
          <EmptyState
            icon={<GitCompareArrows className="w-9 h-9" />}
            title="No colleges to compare"
            description="Search for colleges and click the compare button on any card. You can compare up to 4 colleges at once."
            action={{ label: 'Search Colleges', onClick: () => navigate('/search') }}
          />
        </div>
      </div>
    );
  }

  const metrics = [
    { key: 'city',          label: 'Location',        icon: <MapPin size={14} />,      render: (c: any) => `${c.city}, ${c.state}` },
    { key: 'type',          label: 'Type',             icon: <Award size={14} />,       render: (c: any) => c.type },
    { key: 'established',   label: 'Established',      icon: <Award size={14} />,       render: (c: any) => c.established || '—' },
    { key: 'rating',        label: 'Rating',           icon: <Star size={14} />,        render: (c: any) => `${c.rating} / 5` },
    { key: 'reviewCount',   label: 'Reviews',          icon: <Star size={14} />,        render: (c: any) => c.reviewCount },
    { key: 'fees',          label: 'Fee Range',        icon: <DollarSign size={14} />,  render: (c: any) => `₹${(c.fees.min/100000).toFixed(1)}L – ₹${(c.fees.max/100000).toFixed(1)}L` },
    { key: 'placementRate', label: 'Placement Rate',   icon: <TrendingUp size={14} />,  render: (c: any) => c.placementRate ? `${c.placementRate}%` : '—' },
    { key: 'avgPackage',    label: 'Avg Package',      icon: <DollarSign size={14} />,  render: (c: any) => c.avgPackage || '—' },
    { key: 'highestPackage',label: 'Highest Package',  icon: <DollarSign size={14} />,  render: (c: any) => c.highestPackage || '—' },
    { key: 'accreditation', label: 'Accreditation',    icon: <Award size={14} />,       render: (c: any) => c.accreditation || '—' },
    { key: 'ranking',       label: 'NIRF Rank',        icon: <Award size={14} />,       render: (c: any) => c.ranking ? `#${c.ranking}` : '—' },
    { key: 'streams',       label: 'Streams Offered',  icon: <Award size={14} />,       render: (c: any) => (c.streams||[]).slice(0,3).join(', ') || '—' },
    { key: 'facilities',    label: 'Key Facilities',   icon: <Award size={14} />,       render: (c: any) => (c.facilities||[]).slice(0,3).join(', ') || '—' },
  ];

  const getBestId = (key: string) => {
    if (key === 'rating')        return colleges.reduce((b, c) => c.rating > b.rating ? c : b).id;
    if (key === 'placementRate') return colleges.reduce((b, c) => (c.placementRate||0) > (b.placementRate||0) ? c : b).id;
    if (key === 'ranking')       return colleges.reduce((b, c) => ((c.ranking||999) < (b.ranking||999)) ? c : b).id;
    return null;
  };

  const cols = colleges.length;
  const colStyle = { gridTemplateColumns: `160px repeat(${cols}, 1fr)` };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-[#fafafa] dark:bg-[#060612]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between py-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-display">Compare Colleges</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Side-by-side comparison of {cols} institution{cols !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/search')} className="flex items-center gap-2 h-9 px-4 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-[#6b5fff]/40 transition-colors">
              <Search size={14} /> Add More
            </button>
            <button onClick={clearAll} className="h-9 px-4 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 transition-colors">
              Clear All
            </button>
          </div>
        </motion.div>

        {/* Comparison table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* College cards row */}
            <div className="grid gap-4 mb-3" style={colStyle}>
              <div className="flex items-end pb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Criteria</span>
              </div>
              {colleges.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative p-4 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] text-center"
                >
                  <button
                    onClick={() => removeCollege(c.id)}
                    className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg bg-gray-100 dark:bg-[#1a1a2e] flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 transition-all"
                    aria-label={`Remove ${c.name}`}
                  >
                    <X size={12} />
                  </button>
                  <img src={c.image} alt={c.name} className="w-full h-24 object-cover rounded-xl mb-3" loading="lazy" />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">{c.name}</h3>
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.rating}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Metrics rows */}
            {metrics.map((metric, ri) => {
              const bestId = getBestId(metric.key);
              return (
                <div
                  key={metric.key}
                  className={`grid gap-4 py-3 px-3 rounded-xl ${ri % 2 === 0 ? 'bg-gray-50/70 dark:bg-white/2' : ''}`}
                  style={colStyle}
                >
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-[#6b5fff]/70">{metric.icon}</span>
                    <span className="font-medium">{metric.label}</span>
                  </div>
                  {colleges.map(c => {
                    const isBest = bestId === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`text-sm text-center px-3 py-1.5 rounded-xl transition-colors ${
                          isBest
                            ? 'bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 text-[#6b5fff] dark:text-[#a89fff] font-semibold ring-1 ring-[#6b5fff]/20'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {metric.render(c)}
                        {isBest && <div className="text-[9px] font-bold text-[#6b5fff]/70 mt-0.5">★ Best</div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
