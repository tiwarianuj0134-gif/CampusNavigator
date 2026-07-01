/**
 * Floating Card Component
 * Animated floating UI elements for visual interest
 */

import { motion } from 'framer-motion';
import { Star, TrendingUp, Award, Users } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FloatingCardProps {
  variant: 'rating' | 'stat' | 'badge' | 'user';
  className?: string;
  delay?: number;
}

export default function FloatingCard({ variant, className, delay = 0 }: FloatingCardProps) {
  const baseAnimation = {
    y: [0, -10, 0],
    rotate: [-1, 1, -1],
  };

  const content = {
    rating: (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Star size={16} className="text-amber-500 fill-amber-500" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Average Rating</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">4.8/5.0</p>
        </div>
      </div>
    ),
    stat: (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <TrendingUp size={16} className="text-emerald-500" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Success Rate</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">95%</p>
        </div>
      </div>
    ),
    badge: (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#a855f7] shadow-xl shadow-[#6b5fff]/25">
        <Award size={16} className="text-white" />
        <span className="text-sm font-medium text-white">Top Rated</span>
      </div>
    ),
    user: (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex -space-x-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-bold"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Active Users</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">15,000+</p>
        </div>
      </div>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, ...baseAnimation }}
      transition={{
        opacity: { delay, duration: 0.5 },
        y: { delay: delay + 0.5, duration: 4, repeat: Infinity, ease: 'easeInOut' },
        rotate: { delay: delay + 0.5, duration: 6, repeat: Infinity, ease: 'easeInOut' },
      }}
      className={cn('absolute', className)}
    >
      {content[variant]}
    </motion.div>
  );
}
