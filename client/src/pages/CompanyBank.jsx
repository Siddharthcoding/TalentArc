import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Building2, ChevronRight, Globe, Loader2, Search } from "lucide-react";
import { getCompanies } from "@/services/api";
import SectionWrapper from "@/components/ui/SectionWrapper";

export default function CompanyBank() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCompanies()
      .then((res) => {
        if (res.success) setCompanies(res.data);
        else setError(res.error || "Failed to load companies");
      })
      .catch((err) => setError(err?.message || err?.error || "Network error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return companies;
    return companies.filter((company) =>
      company.name.toLowerCase().includes(query) ||
      (company.description || "").toLowerCase().includes(query)
    );
  }, [companies, search]);

  return (
    <SectionWrapper className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-200/50 dark:border-violet-800/30 mb-4"
          >
            <Building2 className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">Company Question Bank</span>
          </motion.div>
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white sm:text-5xl tracking-tight leading-none mb-3">
            Explore Question Banks
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Browse company-specific interview question libraries curated across coding, design, behavioral, and visual prompts.
          </p>
        </div>

        <div className="relative max-w-xl mx-auto mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 rounded-xl text-red-700 dark:text-red-400 text-sm max-w-xl mx-auto">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-zinc-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{search ? "No companies match your search." : "No companies have been added yet."}</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  to={`/company-bank/${company.id}`}
                  className="glass-card p-5 flex flex-col gap-3 hover:border-indigo-400/50 dark:hover:border-indigo-500/30 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-sm overflow-hidden">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (company.name[0] || "?").toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white truncate">{company.name}</h2>
                    {company.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{company.description}</p>
                    )}
                    {company.website && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-500">
                        <Globe className="w-3 h-3" />
                        Website listed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs text-zinc-400">{company.question_count || 0} questions</span>
                    <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
