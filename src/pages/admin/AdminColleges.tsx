import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Star, Search, Download } from 'lucide-react';
import Badge from '@/components/common/Badge';
import { Skeleton } from '@/components/loaders/Skeleton';
import { adminService } from '@/services/api/adminService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import type { College } from '@/data/mockData';

export default function AdminColleges() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    adminService.getColleges().then(({ data }) => { setColleges(data); setLoading(false); });
  }, []);

  const filtered = colleges.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setColleges(prev => prev.filter(c => c.id !== id));
    toast.success('College deleted successfully');
    setDeleteId(null);
  };

  const handleExport = () => {
    const csv = ['Name,City,State,Type,Rating'].concat(
      colleges.map(c => `"${c.name}","${c.city}","${c.state}","${c.type}","${c.rating}"`)
    ).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'colleges.csv' });
    a.click();
    toast.success('Exported to colleges.csv');
  };

  const miniStats = [
    { label: 'Total', value: colleges.length },
    { label: 'Government', value: colleges.filter(c => c.type === 'Government').length },
    { label: 'Private', value: colleges.filter(c => c.type === 'Private').length },
    { label: 'Avg Rating', value: colleges.length ? (colleges.reduce((a, c) => a + c.rating, 0) / colleges.length).toFixed(1) : '—' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-display">Manage Colleges</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Add, edit, and manage colleges listed on the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="h-9 px-3 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-[#6b5fff]/40 flex items-center gap-1.5 transition-all">
            <Download size={14} /> Export
          </button>
          <button className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-[#6b5fff]/20">
            <Plus size={14} /> Add College
          </button>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {miniStats.map((s, i) => (
          <div key={i} className="px-4 py-3 rounded-xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center text-gray-400 pointer-events-none z-10">
          <Search size={15} />
        </span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by college name or city..."
          className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 dark:border-[#1c1c35] bg-white dark:bg-[#0e0e20] text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6b5fff]/25 focus:border-[#6b5fff]/60 transition-all"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-[#060612] border-b border-gray-100 dark:border-[#1c1c35]">
          {['College', 'Location', 'Type', 'Rating', 'Actions'].map(h => (
            <span key={h} className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-[#1c1c35]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center">
                <div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" /><Skeleton className="flex-1 h-4" /></div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No colleges match "{search}"</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-[#1c1c35]">
            {filtered.map((college, i) => (
              <motion.div
                key={college.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
              >
                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <img src={college.image} alt={college.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{college.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{(college.streams || []).slice(0, 2).join(', ')}</p>
                  </div>
                </div>
                {/* Location */}
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{college.city}, {college.state}</span>
                {/* Type */}
                <Badge variant={college.type === 'Government' ? 'success' : 'default'} className="w-fit">{college.type}</Badge>
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{college.rating}</span>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Link to={`/college/${college.id}`} target="_blank" className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#6b5fff] hover:bg-[#6b5fff]/8 transition-all" aria-label="View">
                    <Eye size={14} />
                  </Link>
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#6b5fff] hover:bg-[#6b5fff]/8 transition-all" aria-label="Edit" onClick={() => toast.info('Edit coming soon')}>
                    <Edit size={14} />
                  </button>
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 transition-all" aria-label="Delete" onClick={() => handleDelete(college.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        {!loading && (
          <div className="px-5 py-3 bg-gray-50 dark:bg-[#060612] border-t border-gray-100 dark:border-[#1c1c35] text-xs text-gray-400">
            Showing {filtered.length} of {colleges.length} colleges
          </div>
        )}
      </div>
    </div>
  );
}
