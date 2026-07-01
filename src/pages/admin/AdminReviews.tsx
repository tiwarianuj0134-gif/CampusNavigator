import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Eye, Star, Filter, MessageSquare } from 'lucide-react';
import Badge from '@/components/common/Badge';
import { Skeleton } from '@/components/loaders/Skeleton';
import { adminService } from '@/services/api/adminService';
import { toast } from 'sonner';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    setLoading(true);
    adminService.getReviews(filter).then(data => { setReviews(data); setLoading(false); });
  }, [filter]);

  const handleApprove = (id: string) => {
    toast.success('Review approved and published');
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const handleReject = (id: string) => {
    toast.error('Review rejected');
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-display">Review Moderation</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Approve or reject user-submitted college reviews</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-xl border border-gray-200 dark:border-[#1c1c35] bg-white dark:bg-[#0e0e20] text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6b5fff]/25 cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
              <div className="flex items-start gap-4">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-3/4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#1a1a2e] flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No {filter} reviews to show</p>
          </div>
        ) : (
          reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] hover:border-[#6b5fff]/15 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6b5fff] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.userName}</p>
                      <Badge variant="info" className="text-[10px]">College: {review.collegeId}</Badge>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={12} className={j < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'} />
                      ))}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{review.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">{review.content}</p>
                    <p className="text-xs text-gray-400 mt-2">Submitted {review.date}</p>
                  </div>
                </div>

                <div className="flex items-center md:flex-col gap-2 flex-shrink-0">
                  <button className="h-8 px-3 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#1c1c35] hover:border-[#6b5fff]/40 hover:text-[#6b5fff] flex items-center gap-1.5 transition-all">
                    <Eye size={13} /> View
                  </button>
                  {filter === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="h-8 px-3 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/15 hover:bg-emerald-100 dark:hover:bg-emerald-900/25 flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        className="h-8 px-3 rounded-lg text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/25 flex items-center gap-1.5 transition-all"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
