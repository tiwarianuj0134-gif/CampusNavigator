/**
 * SearchPage — Professional search with filters
 * Shows auth gate if not logged in
 */
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, SlidersHorizontal, Mic, MicOff, ChevronDown,
  Grid3X3, List, Loader2, History, Lock, ArrowRight
} from 'lucide-react';
import CollegeCard from '@/components/cards/CollegeCard';
import EmptyState from '@/components/common/EmptyState';
import { CollegeCardSkeleton } from '@/components/loaders/Skeleton';
import { collegeService } from '@/services/api/collegeService';
import { useDebounce } from '@/hooks/useDebounce';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useAuthStore } from '@/context/authStore';
import { STREAMS, SORT_OPTIONS, LOCATIONS } from '@/constants';
import type { College } from '@/data/mockData';

const RECENT_KEY = 'cn_recent_searches';
const getRecent = (): string[] => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } };
const addRecent = (q: string) => { if (!q.trim()) return; const r = getRecent().filter(s => s !== q); r.unshift(q); localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(0, 5))); };

// ── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pt-20 pb-16 bg-[#fafafa] dark:bg-[#060612] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 flex items-center justify-center mx-auto mb-6 border border-[#6b5fff]/12">
          <Lock className="w-9 h-9 text-[#6b5fff]" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 font-display">
          Sign in to search colleges
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Create a free account to search, filter, and compare 2,500+ colleges across India with AI-powered recommendations.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/register')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white font-semibold shadow-lg shadow-[#6b5fff]/25 hover:shadow-xl hover:shadow-[#6b5fff]/35 hover:-translate-y-px transition-all"
          >
            Create Free Account <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Sign In
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-6">Free forever. No credit card required.</p>
      </motion.div>
    </div>
  );
}

// ── Main Search Component ────────────────────────────────────────────────────
function SearchContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [stream, setStream] = useState(searchParams.get('stream') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating');
  const [colleges, setColleges] = useState<College[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const debouncedQuery = useDebounce(query, 380);
  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceSearch();

  useEffect(() => { if (transcript) setQuery(transcript); }, [transcript]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (debouncedQuery) p.set('q', debouncedQuery);
    if (stream) p.set('stream', stream);
    if (location) p.set('location', location);
    if (sort !== 'rating') p.set('sort', sort);
    setSearchParams(p, { replace: true });
  }, [debouncedQuery, stream, location, sort, setSearchParams]);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await collegeService.getAll({ search: debouncedQuery, stream, sort });
      setColleges(res.data);
      setTotal(res.total);
      if (debouncedQuery) addRecent(debouncedQuery);
    } catch { setColleges([]); }
    finally { setLoading(false); }
  }, [debouncedQuery, stream, sort]);

  useEffect(() => { fetchColleges(); }, [fetchColleges]);

  const activeFilters = useMemo(() => {
    const f: { key: string; value: string }[] = [];
    if (stream) f.push({ key: 'stream', value: stream });
    if (location) f.push({ key: 'location', value: location });
    return f;
  }, [stream, location]);

  const clearFilter = (key: string) => { if (key === 'stream') setStream(''); if (key === 'location') setLocation(''); };
  const clearAll = () => { setQuery(''); setStream(''); setLocation(''); setSort('rating'); };
  const recent = getRecent();

  return (
    <div className="min-h-screen pt-20 pb-16 bg-[#fafafa] dark:bg-[#060612]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 font-display">
            Discover Colleges
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {total > 0 ? `Explore ${total.toLocaleString()} institutions across India` : 'Search across 2,500+ colleges'}
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="sticky top-16 z-20 bg-white/90 dark:bg-[#060612]/90 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#1c1c35] p-4 mb-6 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search input */}
            <div className="flex-1 relative">
              <span className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center text-gray-400 pointer-events-none z-10">
                <Search size={17} />
              </span>
              <input
                type="text"
                placeholder="Search by name, city, stream, or keyword..."
                value={query}
                onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                className="w-full h-11 pl-11 pr-12 rounded-xl border border-gray-200 dark:border-[#1c1c35] bg-white dark:bg-[#0e0e20] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5fff]/25 focus:border-[#6b5fff]/60 transition-all"
              />
              {isSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8'}`}
                  aria-label={isListening ? 'Stop listening' : 'Voice search'}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
              {/* Recent search dropdown */}
              <AnimatePresence>
                {showSuggestions && !query && recent.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0e0e20] rounded-2xl border border-gray-100 dark:border-[#1c1c35] shadow-2xl z-30 overflow-hidden"
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-[#1c1c35] flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      <History size={12} /> Recent Searches
                    </div>
                    {recent.map((s, i) => (
                      <button key={i} onClick={() => { setQuery(s); setShowSuggestions(false); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/4 transition-colors">
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="appearance-none h-11 pl-4 pr-9 rounded-xl border border-gray-200 dark:border-[#1c1c35] bg-white dark:bg-[#0e0e20] text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6b5fff]/25 cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-11 px-4 rounded-xl flex items-center gap-2 text-sm font-medium border transition-all ${
                  showFilters || activeFilters.length > 0
                    ? 'bg-[#6b5fff] text-white border-[#6b5fff] shadow-md shadow-[#6b5fff]/25'
                    : 'bg-white dark:bg-[#0e0e20] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#1c1c35] hover:border-[#6b5fff]/40'
                }`}
              >
                <SlidersHorizontal size={15} />
                <span className="hidden sm:inline">Filters</span>
                {activeFilters.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white/25 text-xs font-bold flex items-center justify-center">{activeFilters.length}</span>
                )}
              </button>

              <div className="hidden md:flex items-center rounded-xl border border-gray-200 dark:border-[#1c1c35] overflow-hidden">
                {(['grid', 'list'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`p-2.5 transition-colors ${viewMode === m ? 'bg-[#6b5fff] text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-white dark:bg-[#0e0e20]'}`}
                    aria-label={`${m} view`}
                  >
                    {m === 'grid' ? <Grid3X3 size={17} /> : <List size={17} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-[#1c1c35] space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stream</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setStream('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!stream ? 'bg-[#6b5fff] text-white' : 'bg-gray-100 dark:bg-[#1a1a2e] text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>All</button>
                      {STREAMS.map(s => (
                        <button key={s} onClick={() => setStream(stream === s ? '' : s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${stream === s ? 'bg-[#6b5fff] text-white' : 'bg-gray-100 dark:bg-[#1a1a2e] text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setLocation('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!location ? 'bg-[#6b5fff] text-white' : 'bg-gray-100 dark:bg-[#1a1a2e] text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>All</button>
                      {LOCATIONS.slice(0, 10).map(l => (
                        <button key={l} onClick={() => setLocation(location === l ? '' : l)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${location === l ? 'bg-[#6b5fff] text-white' : 'bg-gray-100 dark:bg-[#1a1a2e] text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active chips */}
          {(query || activeFilters.length > 0) && (
            <div className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-[#1c1c35]">
              <span className="text-xs text-gray-400">Active:</span>
              {query && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#6b5fff]/8 text-[#6b5fff] dark:text-[#a89fff] text-xs font-medium border border-[#6b5fff]/15">
                  "{query}"
                  <button onClick={() => setQuery('')}><X size={11} /></button>
                </span>
              )}
              {activeFilters.map(f => (
                <span key={f.key} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#6b5fff]/8 text-[#6b5fff] dark:text-[#a89fff] text-xs font-medium border border-[#6b5fff]/15">
                  {f.value}
                  <button onClick={() => clearFilter(f.key)}><X size={11} /></button>
                </span>
              ))}
              <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600 font-medium ml-1">Clear all</button>
            </div>
          )}
        </motion.div>

        {/* Results */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className={`grid gap-5 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {Array.from({ length: 6 }).map((_, i) => <CollegeCardSkeleton key={i} />)}
            </div>
          ) : colleges.length === 0 ? (
            <EmptyState title="No colleges found" description="Try adjusting your search term or filters." action={{ label: 'Clear All Filters', onClick: clearAll }} />
          ) : (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{colleges.length}</span> of{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{total}</span> colleges
              </p>
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <AnimatePresence mode="popLayout">
                  {colleges.map((c, i) => <CollegeCard key={c.id} college={c} index={i} />)}
                </AnimatePresence>
              </div>
              {colleges.length < total && (
                <div className="text-center mt-10">
                  <button className="px-6 py-3 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2 mx-auto">
                    <Loader2 size={15} className="animate-spin text-[#6b5fff]" /> Loading more...
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Export: Show auth gate or search based on auth state ──────────────────────
export default function SearchPage() {
  const { isAuthenticated } = useAuthStore();
  // All hooks are called at the top level — no conditional hooks
  if (!isAuthenticated) return <AuthGate />;
  return <SearchContent />;
}
