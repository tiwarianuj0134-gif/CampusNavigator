import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, GraduationCap } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#060612] px-4">
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-[#6b5fff]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-[#a855f7]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-center max-w-lg"
      >
        {/* Big 404 */}
        <div className="relative mb-8">
          <div className="text-[120px] md:text-[160px] font-black gradient-text font-display leading-none select-none opacity-20">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 border border-[#6b5fff]/12 flex items-center justify-center">
              <GraduationCap className="w-12 h-12 text-[#6b5fff]" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 font-display">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/5 hover:border-[#6b5fff]/30 transition-all"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white font-medium text-sm shadow-lg shadow-[#6b5fff]/25 hover:shadow-xl hover:shadow-[#6b5fff]/35 hover:-translate-y-px transition-all"
          >
            <Home size={16} /> Back to Home
          </button>
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#6b5fff]/30 text-[#6b5fff] dark:text-[#a89fff] font-medium text-sm hover:bg-[#6b5fff]/6 transition-all"
          >
            <Search size={16} /> Find Colleges
          </button>
        </div>
      </motion.div>
    </div>
  );
}
