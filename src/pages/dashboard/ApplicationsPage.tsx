import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, AlertCircle, ExternalLink, Plus } from 'lucide-react';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import { Skeleton } from '@/components/loaders/Skeleton';
import { dashboardService } from '@/services/api/dashboardService';
import { useNavigate, Link } from 'react-router-dom';

const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'info' | 'danger'; icon: React.ReactNode; label: string }> = {
  submitted:  { variant: 'info',    icon: <Clock size={13} />,         label: 'Submitted' },
  'in-review':{ variant: 'warning', icon: <AlertCircle size={13} />,   label: 'In Review' },
  accepted:   { variant: 'success', icon: <CheckCircle size={13} />,   label: 'Accepted' },
  rejected:   { variant: 'danger',  icon: <AlertCircle size={13} />,   label: 'Rejected' },
};

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getApplications().then(data => { setApplications(data); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-display">My Applications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Track all your college applications in one place</p>
        </div>
        <button
          onClick={() => navigate('/search')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white text-sm font-semibold shadow-md shadow-[#6b5fff]/20 hover:shadow-lg hover:shadow-[#6b5fff]/30 hover:-translate-y-px transition-all"
        >
          <Plus size={15} /> Add Application
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35]">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
                <div className="flex-1"><Skeleton className="w-48 h-5 mb-2" /><Skeleton className="w-32 h-4" /></div>
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-9 h-9" />}
          title="No applications yet"
          description="You haven't applied to any colleges yet. Explore colleges and start applying to your dream institutions!"
          action={{ label: 'Find Colleges', onClick: () => navigate('/search') }}
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app, i) => {
            const status = statusConfig[app.status] || statusConfig.submitted;
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group p-5 rounded-2xl bg-white dark:bg-[#0e0e20] border border-gray-100 dark:border-[#1c1c35] hover:shadow-lg hover:shadow-[#6b5fff]/6 hover:border-[#6b5fff]/15 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-full sm:w-16 h-28 sm:h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={app.college.image} alt={app.college.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/college/${app.college.id}`} className="group/link">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover/link:text-[#6b5fff] transition-colors truncate">{app.college.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{app.course}</p>
                    <p className="text-xs text-gray-400 mt-1">Applied on {app.date}</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <Badge variant={status.variant} className="flex items-center gap-1 py-1">
                      {status.icon} {status.label}
                    </Badge>
                    <Link to={`/college/${app.college.id}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#6b5fff] hover:bg-[#6b5fff]/8 transition-all">
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
