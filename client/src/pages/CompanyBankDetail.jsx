import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  FileText,
  Image,
  Loader2,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { deleteCompanyQuestion, getCompany, getCompanyQuestions } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedButton from "@/components/ui/AnimatedButton";

const TYPE_ICONS = { text: FileText, mcq: BookOpen, image: Image };
const TYPE_COLORS = {
  text: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
  mcq: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
  image: "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
};
const DIFF_COLORS = {
  Easy: "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400",
  Medium: "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400",
  Hard: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400",
};

function parseOptions(options) {
  if (Array.isArray(options)) return options;
  if (!options) return [];
  try {
    const parsed = JSON.parse(options);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function QuestionCard({ q, isAdmin, companyId, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = TYPE_ICONS[q.type] || FileText;
  const options = parseOptions(q.options);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${TYPE_COLORS[q.type] || ""}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[q.type] || ""}`}>
              {q.type?.toUpperCase()}
            </span>
            {q.difficulty && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFF_COLORS[q.difficulty] || "bg-zinc-100 text-zinc-600"}`}>
                {q.difficulty}
              </span>
            )}
            {(q.tags || []).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white leading-snug">{q.title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <>
              <Link
                to={`/admin/company-bank?company=${companyId}`}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                title="Edit in admin"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => onDelete(q.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
              {q.body && q.type !== "image" && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">{q.body}</p>
              )}

              {q.type === "mcq" && options.length > 0 && (
                <div className="space-y-2">
                  {options.map((opt, index) => (
                    <div
                      key={`${opt}-${index}`}
                      className={`flex items-center gap-2.5 p-3 rounded-xl text-sm border transition-all ${
                        index === q.correct_option
                          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300"
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {index === q.correct_option ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 shrink-0 rounded-full border-2 border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                          {String.fromCharCode(65 + index)}
                        </span>
                      )}
                      {opt}
                    </div>
                  ))}
                </div>
              )}

              {q.type === "image" && (
                <div className="space-y-2">
                  {q.body && <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{q.body}</p>}
                  {q.image_url ? (
                    <img
                      src={q.image_url}
                      alt={q.title}
                      className="rounded-xl max-w-full border border-zinc-200 dark:border-zinc-800"
                    />
                  ) : (
                    <p className="text-sm text-zinc-400">No image URL saved for this prompt.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CompanyBankDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.isAdmin;

  const [company, setCompany] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDiff, setFilterDiff] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, qRes] = await Promise.all([getCompany(id), getCompanyQuestions(id)]);
      if (!compRes.success) throw new Error(compRes.error || "Company not found");
      if (!qRes.success) throw new Error(qRes.error || "Failed to load questions");
      setCompany(compRes.data);
      setQuestions(qRes.data);
    } catch (err) {
      setError(err?.message || err?.error || "Failed to load company bank");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (qid) => {
    if (!window.confirm("Delete this question? This cannot be undone.")) return;
    try {
      const res = await deleteCompanyQuestion(qid);
      if (res.success) {
        setQuestions((existing) => existing.filter((question) => question.id !== qid));
      }
    } catch (err) {
      setError(err?.message || err?.error || "Delete failed");
    }
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return questions.filter((question) => {
      if (filterType !== "all" && question.type !== filterType) return false;
      if (filterDiff !== "all" && question.difficulty !== filterDiff) return false;
      if (!query) return true;
      return (
        question.title.toLowerCase().includes(query) ||
        (question.body || "").toLowerCase().includes(query) ||
        (question.tags || []).some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [filterDiff, filterType, questions, search]);

  return (
    <SectionWrapper className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto relative z-10">
        <Link
          to="/company-bank"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          All Companies
        </Link>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 rounded-xl text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && company && (
          <>
            <div className="glass-card p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0 overflow-hidden">
                {company.logo_url ? (
                  <img src={company.logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (company.name[0] || "?").toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">{company.name}</h1>
                {company.description && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{company.description}</p>}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline mt-1 inline-block">
                    {company.website}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-4 sm:justify-end shrink-0">
                <div className="text-left sm:text-right">
                  <p className="text-3xl font-black text-zinc-900 dark:text-white">{questions.length}</p>
                  <p className="text-xs text-zinc-400">Questions</p>
                </div>
                {isAdmin && (
                  <Link to={`/admin/company-bank?company=${id}`}>
                    <AnimatedButton variant="primary" className="text-sm !px-4 !py-2 shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                      Manage
                    </AnimatedButton>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="text">Text</option>
                <option value="mcq">MCQ</option>
                <option value="image">Image</option>
              </select>
              <select
                value={filterDiff}
                onChange={(e) => setFilterDiff(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-zinc-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No questions match your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((question) => (
                  <QuestionCard
                    key={question.id}
                    q={question}
                    isAdmin={isAdmin}
                    companyId={id}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </SectionWrapper>
  );
}
