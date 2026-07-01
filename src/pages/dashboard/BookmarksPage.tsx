import { motion } from 'framer-motion';
import { Bookmark, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CollegeCard from '@/components/cards/CollegeCard';
import EmptyState from '@/components/common/EmptyState';
import { useBookmarkStore } from '@/context/bookmarkStore';

export default function BookmarksPage() {
  const navigate = useNavigate();
  const { bookmarkedColleges } = useBookmarkStore();

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-display">Bookmarked Colleges</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {bookmarkedColleges.length} college{bookmarkedColleges.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        {bookmarkedColleges.length > 0 && (
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-[#6b5fff]/40 transition-colors"
          >
            <Search size={15} /> Find More
          </button>
        )}
      </div>

      {bookmarkedColleges.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-9 h-9" />}
          title="No bookmarks yet"
          description="Start exploring colleges and tap the bookmark icon on any college card to save it here for later."
          action={{ label: 'Explore Colleges', onClick: () => navigate('/search') }}
        />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarkedColleges.map((college, i) => (
            <CollegeCard key={college.id} college={college} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
