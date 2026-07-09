import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { getReports, deleteReport } from '@/services/api';
import ReportCard from '@/components/reports/ReportCard';
import ReportsEmpty from '@/components/reports/ReportsEmpty';
import { cn } from '@/utils/cn';

const FILTERS = [
  { key: null, label: 'All', icon: null },
  { key: 'ats', label: 'ATS Score', icon: FileText },
  { key: 'jd_match', label: 'JD Match', icon: Briefcase },
];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReports(activeFilter);
      setReports(res.data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
    }
  }, []);

  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-400/5 rounded-full blur-3xl" />

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              My Reports
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              View all your saved ATS analyses and JD match results.
            </p>
          </div>

          <div className="flex items-center gap-2 mb-8">
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.key;
              const Icon = f.icon;
              return (
                <button
                  key={f.key || 'all'}
                  onClick={() => setActiveFilter(f.key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {f.label}
                </button>
              );
            })}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <p className="text-sm text-zinc-400">Loading reports...</p>
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 flex items-center gap-4"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">Failed to load reports</p>
                <p className="text-xs text-zinc-500 mt-0.5">{error}</p>
              </div>
              <button
                onClick={fetchReports}
                className="ml-auto text-sm text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
              >
                Try again
              </button>
            </motion.div>
          )}

          {!loading && !error && reports.length === 0 && <ReportsEmpty />}

          {!loading && reports.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter || 'all'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {reports.map((r, i) => (
                  <ReportCard key={r.id} report={r} index={i} onDelete={handleDelete} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}
