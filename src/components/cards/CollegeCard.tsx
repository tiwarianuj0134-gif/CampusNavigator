import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Bookmark, BookmarkCheck, GitCompareArrows, Star, TrendingUp, Lock } from 'lucide-react';
import type { College } from '@/data/mockData';
import { useBookmarkStore } from '@/context/bookmarkStore';
import { useCompareStore } from '@/context/compareStore';
import { useAuthStore } from '@/context/authStore';
import { toast } from 'sonner';

interface CollegeCardProps {
  college: College;
  index?: number;
  matchScore?: number;
}

export default function CollegeCard({ college, index = 0, matchScore }: CollegeCardProps) {
  const { toggle, isBookmarked } = useBookmarkStore();
  const { addCollege, removeCollege, colleges: compareList } = useCompareStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const bookmarked = isBookmarked(college.id);
  const inCompare = compareList.some(c => c.id === college.id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.info('Please sign in to bookmark colleges'); navigate('/login'); return; }
    toggle(college);
    toast.success(isBookmarked(college.id) ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.info('Please sign in to compare colleges'); navigate('/login'); return; }
    if (inCompare) { removeCollege(college.id); toast.info('Removed from comparison'); }
    else if (compareList.length >= 4) { toast.warning('You can compare up to 4 colleges at once'); }
    else { addCollege(college); toast.success('Added to comparison'); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45 }}
      className="group relative bg-white dark:bg-[#0e0e20] rounded-2xl border border-gray-100 dark:border-[#1c1c35] overflow-hidden hover:shadow-2xl hover:shadow-[#6b5fff]/8 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Match Score Badge */}
      {matchScore && (
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white text-[11px] font-bold shadow-lg shadow-[#6b5fff]/30">
          {matchScore}% Match
        </div>
      )}

      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={college.image}
          alt={college.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleBookmark}
            className={`w-8 h-8 rounded-xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 ${
              bookmarked
                ? 'bg-[#6b5fff] text-white shadow-lg shadow-[#6b5fff]/30'
                : 'bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-300'
            }`}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
          <button
            onClick={handleCompare}
            className={`w-8 h-8 rounded-xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 ${
              inCompare
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-300'
            }`}
            aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
          >
            <GitCompareArrows size={15} />
          </button>
        </div>

        {/* Rating pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-white text-xs font-semibold">{college.rating}</span>
          <span className="text-white/60 text-[10px]">({college.reviewCount})</span>
        </div>

        {/* Type badge */}
        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white/80 text-[10px] font-medium">
          {college.type}
        </div>
      </div>

      {/* Content */}
      <Link to={`/college/${college.id}`} className="block p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-[#6b5fff] dark:group-hover:text-[#a89fff] transition-colors mb-1.5">
            {college.name}
          </h3>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <MapPin size={12} className="flex-shrink-0" />
            <span>{college.city}, {college.state}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(college.tags || []).slice(0, 3).map(tag => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>

        {/* Placement stat if available */}
        {college.placements?.placementRate && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={12} />
            <span className="font-medium">{college.placements.placementRate}% placement rate</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#1c1c35]">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Fees from</p>
            <p className="text-base font-bold text-gray-900 dark:text-white">
              ₹{(college.fees.min / 100000).toFixed(1)}L
            </p>
          </div>
          <span className="text-xs font-semibold text-[#6b5fff] dark:text-[#a89fff] group-hover:underline flex items-center gap-1">
            View Details <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
