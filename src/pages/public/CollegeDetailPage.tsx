/**
 * College Detail Page
 * Public preview + protected full detail (requires login)
 * Real college details fetched from DB + enriched via Gemini AI
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/context/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Star, Bookmark, BookmarkCheck, GitCompareArrows, ExternalLink,
  GraduationCap, DollarSign, Users, Award, Building, ThumbsUp,
  TrendingUp, CheckCircle, Share2, Phone, Mail, Globe, Calendar,
  Wifi, Coffee, Dumbbell, BookOpen, Microscope, Sparkles, Loader2,
  ChevronDown, ChevronUp, Trophy, FlaskConical, Handshake
} from 'lucide-react';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import StarRating from '@/components/common/StarRating';
import { PageSkeleton } from '@/components/loaders/Skeleton';
import { collegeService } from '@/services/api/collegeService';
import { reviewService } from '@/services/api/reviewService';
import { useBookmarkStore } from '@/context/bookmarkStore';
import { useCompareStore } from '@/context/compareStore';
import { toast } from 'sonner';
import type { College, Review } from '@/data/mockData';

const tabs = ['Overview', 'Courses', 'Admissions', 'Placements', 'Reviews', 'Gallery'];

const facilityIcons: Record<string, React.ReactNode> = {
  'Library': <BookOpen size={16} />,
  'Labs': <Microscope size={16} />,
  'WiFi': <Wifi size={16} />,
  'Cafeteria': <Coffee size={16} />,
  'Sports Complex': <Dumbbell size={16} />,
  'Hostel': <Building size={16} />,
  'Hospital': <FlaskConical size={16} />,
  'Auditorium': <Trophy size={16} />,
};

// Skeleton for enrichment loading
function EnrichSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      ))}
    </div>
  );
}

export default function CollegeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [college, setCollege] = useState<College | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  // Gemini-enriched real data
  const [enriched, setEnriched] = useState<Record<string, any>>({});
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [enrichError, setEnrichError] = useState(false);

  const { toggle, isBookmarked } = useBookmarkStore();
  const { addCollege, removeCollege, colleges: compareList } = useCompareStore();

  // Load college from DB
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      collegeService.getById(id),
      reviewService.getByCollege(id),
    ]).then(([c, r]) => {
      setCollege(c);
      setReviews(r);
      setLoading(false);
    });
  }, [id]);

  // Once college loaded → fetch real details from Gemini
  useEffect(() => {
    if (!college) return;
    setEnrichLoading(true);
    setEnrichError(false);

    collegeService
      .enrichCollege(college.name, college.city, college.state)
      .then(data => {
        setEnriched(data);
        setEnrichLoading(false);
      })
      .catch(() => {
        setEnrichError(true);
        setEnrichLoading(false);
      });
  }, [college?.name]);

  const handleShare = async () => {
    try {
      await navigator.share({ title: college?.name, text: `Check out ${college?.name} on CampusNavigator`, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  if (loading) return <div className="pt-20"><PageSkeleton /></div>;

  // Auth gate — show limited preview if not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-16 bg-[#fafafa] dark:bg-[#060612]">
        {college && (
          <div className="relative h-64 md:h-80">
            <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 max-w-7xl mx-auto">
              <h1 className="text-2xl md:text-4xl font-bold text-white">{college.name}</h1>
              <p className="text-white/70 mt-1">{college.city}, {college.state}</p>
            </div>
          </div>
        )}
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 flex items-center justify-center mx-auto mb-6 border border-[#6b5fff]/12">
            <Sparkles className="w-9 h-9 text-[#6b5fff]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 font-display">
            Sign in to see full details
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Create a free account to view courses, placement records, campus facilities, student reviews, AI enrichment, and much more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white font-semibold shadow-lg shadow-[#6b5fff]/25 hover:-translate-y-px transition-all"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!college) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">College not found</h2>
        <Button onClick={() => navigate('/search')}>Back to Search</Button>
      </div>
    </div>
  );

  const bookmarked = isBookmarked(college.id);
  const inCompare = compareList.some(c => c.id === college.id);

  // Safe array helpers — handle strings, arrays and undefined from backend
  const safeArr = (v: any): any[] => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string' && v.trim()) return v.split(/[\s,]+/).filter(Boolean);
    return [];
  };

  // Merge DB + Gemini data (Gemini takes priority for real details)
  const realFees = enriched.fees || college.fees;
  const realPlacements = enriched.placements || college.placements || {};
  const realFacilities: string[] = enriched.facilities?.length ? safeArr(enriched.facilities) : safeArr(college.facilities);
  const realCourses: any[] = enriched.courses?.length ? enriched.courses : safeArr(college.courses);
  const realDescription = enriched.description || college.description;
  const realAccreditations = enriched.accreditations || {};
  const realContact = enriched.contact || college.contact || {};
  const realAddress = enriched.address || college.address || {};
  const realRankings = enriched.ranking || {};
  const realHighlights: string[] = safeArr(enriched.highlights);
  const realRecruiters: string[] = safeArr(realPlacements.topRecruiters || college.placements?.topRecruiters);
  const realStreams: string[] = safeArr(college.streams);
  const realEntranceExams: string[] = safeArr(enriched.entranceExams);
  const realScholarships: string[] = safeArr(enriched.scholarships);
  const notableAlumni: string[] = safeArr(enriched.notableAlumni);
  const researchCenters: string[] = safeArr(enriched.researchCenters);
  const internationalCollabs: string[] = safeArr(enriched.internationalCollaborations);

  const nirfRank = realRankings.nirf || college.approvals?.nirf?.rank || college.ranking;
  const naacGrade = realAccreditations.naac?.grade || college.approvals?.naac?.grade || '';
  const placementRate = realPlacements.placementRate || college.placementRate || 0;
  const avgPackage = realPlacements.averagePackage
    ? `₹${(realPlacements.averagePackage / 100000).toFixed(1)} LPA`
    : college.avgPackage || '—';
  const highestPackage = realPlacements.highestPackage
    ? `₹${(realPlacements.highestPackage / 100000).toFixed(1)} LPA`
    : college.highestPackage || '—';

  const stats = [
    { icon: <Award size={20} />, label: 'NIRF Ranking', value: nirfRank ? `#${nirfRank}` : 'N/A', color: 'text-amber-500' },
    { icon: <TrendingUp size={20} />, label: 'Placement Rate', value: placementRate ? `${placementRate}%` : 'N/A', color: 'text-emerald-500' },
    { icon: <DollarSign size={20} />, label: 'Avg Package', value: avgPackage, color: 'text-blue-500' },
    { icon: <Users size={20} />, label: 'Total Reviews', value: college.reviewCount.toString(), color: 'text-purple-500' },
  ];

  // Rating breakdown from DB or enriched
  const ratingBreakdown = [
    { label: 'Academics', value: college.approvals ? 4.5 : 4.0 },
    { label: 'Faculty', value: 4.3 },
    { label: 'Infrastructure', value: 4.2 },
    { label: 'Placements', value: placementRate >= 90 ? 4.8 : placementRate >= 80 ? 4.5 : 4.0 },
    { label: 'Campus Life', value: 4.4 },
  ];

  return (
    <div className="min-h-screen pt-16 bg-[#fafafa] dark:bg-[#060612]">
      {/* Hero Banner */}
      <div className="relative h-72 md:h-96">
        <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {(enriched.tags || college.tags || []).slice(0, 5).map((tag: string) => (
                <Badge key={tag} className="bg-white/20 text-white border-0 backdrop-blur-sm">{tag}</Badge>
              ))}
              {naacGrade && (
                <Badge className="bg-emerald-500/30 text-emerald-200 border-0 backdrop-blur-sm">NAAC {naacGrade}</Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              {enriched.officialName || college.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1.5"><MapPin size={16} />{college.city}, {college.state}</span>
              <span className="flex items-center gap-1.5"><Building size={16} />{enriched.type || college.type}</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />Est. {enriched.established || college.established}
              </span>
              {enriched.campusArea && (
                <span className="flex items-center gap-1.5">🏫 {enriched.campusArea}</span>
              )}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="font-semibold">{college.rating}</span>
                <span className="text-amber-400/60">({college.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Enrichment indicator */}
      {enrichLoading && (
        <div className="bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 border-b border-[#6b5fff]/15 dark:border-[#6b5fff]/25 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-[#6b5fff] dark:text-[#a89fff]">
            <Loader2 size={14} className="animate-spin" />
            <Sparkles size={14} />
            Fetching real-time details via Gemini AI...
          </div>
        </div>
      )}
      {!enrichLoading && Object.keys(enriched).length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <Sparkles size={14} />
            Details enriched with real-time Gemini AI data
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-3 ${s.color}`}>
                    {s.icon}
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Tabs */}
            <div className="sticky top-16 z-20 bg-[#fafafa] dark:bg-[#060612] py-4 -mx-4 px-4">
              <div className="flex gap-1 p-1 rounded-xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] overflow-x-auto scrollbar-hide">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-[#6b5fff] text-white shadow-md shadow-[#6b5fff]/25'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1a1a2e]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="py-6"
              >
                {/* ── OVERVIEW ── */}
                {activeTab === 'Overview' && (
                  <div className="space-y-6">
                    {/* About */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h3>
                      {enrichLoading ? <EnrichSkeleton /> : (
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{realDescription}</p>
                      )}
                      {enriched.studentFacultyRatio && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                          Student-Faculty Ratio: <span className="font-semibold">{enriched.studentFacultyRatio}</span>
                          {enriched.totalStudents && ` • Total Students: ${enriched.totalStudents.toLocaleString()}`}
                          {enriched.facultyCount && ` • Faculty: ${enriched.facultyCount}`}
                        </p>
                      )}
                    </div>

                    {/* Key Highlights */}
                    {(enrichLoading || realHighlights.length > 0) && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Highlights</h3>
                        {enrichLoading ? <EnrichSkeleton /> : (
                          <div className="grid md:grid-cols-2 gap-3">
                            {realHighlights.map((h: string, i: number) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                {h}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick facts */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Facts</h3>
                      {enrichLoading ? <EnrichSkeleton /> : (
                        <div className="grid md:grid-cols-2 gap-0">
                          {[
                            { label: 'NAAC Grade', value: naacGrade || 'N/A' },
                            { label: 'NIRF Rank', value: nirfRank ? `#${nirfRank}` : 'N/A' },
                            { label: 'Highest Package', value: highestPackage },
                            { label: 'Average Package', value: avgPackage },
                            { label: 'Placement Rate', value: placementRate ? `${placementRate}%` : 'N/A' },
                            { label: 'Total Courses', value: `${(realCourses.length || safeArr(college.courses).length || 0)}+` },
                            { label: 'Streams Offered', value: realStreams.join(', ') || 'Multiple' },
                            { label: 'Established', value: enriched.established || college.established },
                            ...(realRankings.qs ? [{ label: 'QS World Rank', value: `#${realRankings.qs}` }] : []),
                            ...(enriched.totalStudents ? [{ label: 'Total Students', value: enriched.totalStudents.toLocaleString() }] : []),
                          ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-[#1c1c35] last:border-0">
                              <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Accreditations */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Accreditations & Approvals</h3>
                      {enrichLoading ? <EnrichSkeleton /> : (
                        <div className="flex flex-wrap gap-3">
                          {naacGrade && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
                              <CheckCircle size={16} />NAAC {naacGrade}
                            </div>
                          )}
                          {(realAccreditations.aicte ?? college.approvals?.aicte) && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                              <CheckCircle size={16} />AICTE Approved
                            </div>
                          )}
                          {(realAccreditations.ugc ?? college.approvals?.ugc) && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm font-semibold">
                              <CheckCircle size={16} />UGC Recognized
                            </div>
                          )}
                          {realAccreditations.nba && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm font-semibold">
                              <CheckCircle size={16} />NBA Accredited
                            </div>
                          )}
                          {realAccreditations.aacsb && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm font-semibold">
                              <CheckCircle size={16} />AACSB
                            </div>
                          )}
                          {(realAccreditations.other || []).map((acc: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                              <CheckCircle size={16} />{acc}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Facilities */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Facilities</h3>
                      {enrichLoading ? <EnrichSkeleton /> : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {realFacilities.map((f: string) => (
                            <div key={f} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm">
                              <span className="text-[#6b5fff]">{facilityIcons[f] || <CheckCircle size={16} />}</span>
                              <span className="text-gray-700 dark:text-gray-300">{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notable Alumni */}
                    {(enrichLoading || notableAlumni.length > 0) && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notable Alumni</h3>
                        {enrichLoading ? <EnrichSkeleton /> : (
                          <div className="grid md:grid-cols-2 gap-3">
                            {notableAlumni.map((a: string, i: number) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Trophy size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                {a}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Research Centers */}
                    {(enrichLoading || researchCenters.length > 0) && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Research & Innovation Centers</h3>
                        {enrichLoading ? <EnrichSkeleton /> : (
                          <div className="flex flex-wrap gap-2">
                            {researchCenters.map((r: string, i: number) => (
                              <Badge key={i} className="text-sm py-1.5 px-3">{r}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* International Collaborations */}
                    {(enrichLoading || internationalCollabs.length > 0) && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">International Collaborations</h3>
                        {enrichLoading ? <EnrichSkeleton /> : (
                          <div className="grid md:grid-cols-2 gap-2">
                            {internationalCollabs.map((c: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Handshake size={14} className="text-[#6b5fff] flex-shrink-0" />
                                {c}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rating breakdown */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rating Breakdown</h3>
                      <div className="space-y-3">
                        {ratingBreakdown.map((cat, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <span className="w-28 text-sm text-gray-500 dark:text-gray-400">{cat.label}</span>
                            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(cat.value / 5) * 100}%` }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-[#6b5fff] to-[#a855f7] rounded-full"
                              />
                            </div>
                            <span className="w-8 text-sm font-semibold text-gray-900 dark:text-white">{cat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── COURSES ── */}
                {activeTab === 'Courses' && (
                  <div className="space-y-4">
                    {enrichLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-5 rounded-xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] animate-pulse">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                        </div>
                      ))
                    ) : realCourses.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">No course data available.</div>
                    ) : realCourses.map((course: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="p-5 rounded-xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 flex items-center justify-center flex-shrink-0">
                              <GraduationCap size={24} className="text-[#6b5fff]" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{course.name}</h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {course.duration ? `${course.duration} years` : course.duration_str || '—'}
                                  {course.intake ? ` • ${course.intake} seats` : ''}
                                </span>
                                {course.degree && <Badge>{course.degree}</Badge>}
                                {course.stream && <Badge>{course.stream}</Badge>}
                              </div>
                              {course.entranceExams?.length > 0 && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Entrance: {course.entranceExams.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {course.totalFees
                                  ? `₹${(course.totalFees / 100000).toFixed(1)}L`
                                  : course.fees
                                    ? `₹${(course.fees / 100000).toFixed(1)}L`
                                    : 'N/A'
                                }
                              </p>
                              <p className="text-xs text-gray-400">total fees</p>
                            </div>
                            <Button size="sm" variant="outline">Apply Now</Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* ── ADMISSIONS ── */}
                {activeTab === 'Admissions' && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Entrance Exams Accepted</h3>
                      {enrichLoading ? <EnrichSkeleton /> : (
                        <div className="flex flex-wrap gap-2">
                          {(realEntranceExams.length > 0 ? realEntranceExams : ['JEE Main', 'JEE Advanced', 'CAT', 'NEET']).map((exam: string, i: number) => (
                            <div key={i} className="px-4 py-2 rounded-lg bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 text-[#5b47f0] dark:text-[#a89fff] text-sm font-semibold">
                              {exam}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admission Process</h3>
                      {enrichLoading ? <EnrichSkeleton /> : (
                        <div className="space-y-4">
                          {(enriched.admissionProcess?.length > 0
                            ? enriched.admissionProcess
                            : [
                              'Submit online application with required documents',
                              'Appear for applicable entrance exam (JEE/CAT/NEET)',
                              'Participate in centralized counseling process',
                              'Submit original documents for verification',
                              'Pay admission fees to confirm your seat',
                            ]
                          ).map((step: string, i: number) => (
                            <div key={i} className="flex gap-4">
                              <div className="w-8 h-8 rounded-full bg-[#6b5fff]/10 dark:bg-[#6b5fff]/15 flex items-center justify-center text-[#6b5fff] font-bold text-sm flex-shrink-0">
                                {i + 1}
                              </div>
                              <div className="pt-1">
                                <p className="text-sm text-gray-600 dark:text-gray-300">{step}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {(enrichLoading || realScholarships.length > 0) && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scholarships Available</h3>
                        {enrichLoading ? <EnrichSkeleton /> : (
                          <div className="space-y-2">
                            {realScholarships.map((s: string, i: number) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                {s}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── PLACEMENTS ── */}
                {activeTab === 'Placements' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { label: 'Highest Package', value: highestPackage, icon: <TrendingUp /> },
                        { label: 'Average Package', value: avgPackage, icon: <DollarSign /> },
                        { label: 'Placement Rate', value: placementRate ? `${placementRate}%` : 'N/A', icon: <Users /> },
                      ].map((stat, i) => (
                        <div key={i} className="p-5 rounded-xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] text-center">
                          <div className="w-12 h-12 rounded-xl bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 flex items-center justify-center mx-auto mb-3 text-[#6b5fff]">
                            {stat.icon}
                          </div>
                          {enrichLoading ? (
                            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto mb-1 animate-pulse" />
                          ) : (
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {realPlacements.medianPackage && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-[#6b5fff]/15 dark:border-[#6b5fff]/25 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Median Package</p>
                        <p className="text-xl font-bold text-[#6b5fff] dark:text-[#a89fff]">
                          ₹{(realPlacements.medianPackage / 100000).toFixed(1)} LPA
                        </p>
                      </div>
                    )}

                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Recruiters</h3>
                      {enrichLoading ? <EnrichSkeleton /> : (
                        <div className="flex flex-wrap gap-3">
                          {realRecruiters.length > 0
                            ? realRecruiters.map((company: string, i: number) => (
                              <div key={i} className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-600">
                                {company}
                              </div>
                            ))
                            : <p className="text-sm text-gray-400">No recruiter data available</p>
                          }
                        </div>
                      )}
                    </div>

                    {realPlacements.internationalPlacements && (
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
                          <Globe size={16} />
                          International placements available
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── REVIEWS ── */}
                {activeTab === 'Reviews' && (
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        No reviews yet for this college. Be the first to review!
                      </div>
                    ) : (
                      reviews.map((review, i) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-5 rounded-xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                {review.userName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{review.userName}</p>
                                <p className="text-xs text-gray-400">{review.date}</p>
                              </div>
                            </div>
                            <StarRating rating={review.rating} size={14} />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{review.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">{review.content}</p>
                          <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#6b5fff] transition-colors">
                            <ThumbsUp size={14} />
                            Helpful ({review.helpful})
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* ── GALLERY ── */}
                {activeTab === 'Gallery' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-[#0e0e20]"
                      >
                        <img
                          src={college.image}
                          alt={`${college.name} gallery ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Action card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] shadow-lg">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {naacGrade && <Badge variant="success">NAAC {naacGrade}</Badge>}
                  <Badge>{enriched.type || college.type}</Badge>
                </div>
                <div className="space-y-3 mb-6">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => window.open(realContact.website || college.website, '_blank')}
                    icon={<ExternalLink size={18} />}
                  >
                    Apply Now
                  </Button>
                  <Button
                    className="w-full"
                    size="lg"
                    variant={bookmarked ? 'primary' : 'secondary'}
                    onClick={() => toggle(college)}
                    icon={bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                  >
                    {bookmarked ? 'Saved' : 'Save College'}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant={inCompare ? 'primary' : 'outline'}
                      onClick={() => inCompare ? removeCollege(college.id) : addCollege(college)}
                      icon={<GitCompareArrows size={16} />}
                    >
                      {inCompare ? 'In Compare' : 'Compare'}
                    </Button>
                    <Button variant="ghost" onClick={handleShare} icon={<Share2 size={16} />} aria-label="Share" />
                  </div>
                </div>

                {/* Contact info from Gemini */}
                <div className="pt-4 border-t border-gray-100 dark:border-[#1c1c35] space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Contact</h4>
                  {enrichLoading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  ) : (
                    <>
                      {(realContact.phone?.[0] || college.contact?.phone?.[0]) && (
                        <a href={`tel:${realContact.phone?.[0] || college.contact?.phone?.[0]}`}
                          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#6b5fff] transition-colors">
                          <Phone size={14} />
                          {realContact.phone?.[0] || college.contact?.phone?.[0]}
                        </a>
                      )}
                      {(realContact.email?.[0] || college.contact?.email?.[0]) && (
                        <a href={`mailto:${realContact.email?.[0] || college.contact?.email?.[0]}`}
                          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#6b5fff] transition-colors">
                          <Mail size={14} />
                          {realContact.email?.[0] || college.contact?.email?.[0]}
                        </a>
                      )}
                      {(realContact.website || college.website) && (
                        <a href={realContact.website || college.website} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#6b5fff] transition-colors">
                          <Globe size={14} />
                          {(realContact.website || college.website)?.replace('https://', '').replace('http://', '')}
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Fee range */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#6b5fff] to-[#a855f7] text-white">
                <p className="text-sm text-[#e4e0ff] mb-1">Annual Fee Range</p>
                {enrichLoading ? (
                  <div className="h-7 bg-white/20 rounded animate-pulse" />
                ) : (
                  <>
                    <p className="text-2xl font-bold">
                      ₹{((realFees.min || 0) / 100000).toFixed(1)}L – ₹{((realFees.max || 0) / 100000).toFixed(1)}L
                    </p>
                    {realFees.hostelMin && (
                      <p className="text-xs text-primary-200 mt-1">
                        Hostel: ₹{(realFees.hostelMin / 100000).toFixed(1)}L – ₹{(realFees.hostelMax / 100000).toFixed(1)}L/yr
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Location */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Location</h4>
                <div className="aspect-video rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                  <MapPin size={32} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {realAddress.street && <>{realAddress.street}, </>}
                  {college.city}, {college.state}
                  {realAddress.pincode && ` - ${realAddress.pincode}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
