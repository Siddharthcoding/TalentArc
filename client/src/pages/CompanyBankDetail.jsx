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
  FileText,
  Image,
  Loader2,
  Search,
  Tag,
  PlusCircle,
  X,
  Send
} from "lucide-react";
import { getCompany, getCompanyQuestions, contributeCompanyQuestion } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const TYPE_ICONS = { text: FileText, mcq: BookOpen, image: Image };

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

const inputStyle = {
  width: "100%",
  padding: "9px 14px",
  borderRadius: "14px",
  border: "1.5px solid rgba(15, 163, 78, 0.25)",
  background: "#DFF5E6",
  color: "#0B7C3C",
  fontSize: "13px",
  fontWeight: 600,
  outline: "none",
  fontFamily: "Inter, sans-serif",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  color: "#0FA34E",
  marginBottom: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

function QuestionCard({ q }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = TYPE_ICONS[q.type] || FileText;
  const options = parseOptions(q.options);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#F6E9D2] border-2 border-[#0FA34E]/20 rounded-3xl p-5 shadow-md overflow-hidden text-left"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center shrink-0 shadow">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0FA34E] text-[#F6E9D2]">
              {q.type?.toUpperCase()}
            </span>
            {q.difficulty && (
              <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D7F27A] text-[#0FA34E] border border-[#0FA34E]/20">
                {q.difficulty}
              </span>
            )}
            {(q.tags || []).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#D7F27A] text-[#0B7C3C]">
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
          <h3 className="font-display font-extrabold text-base text-[#0FA34E] leading-snug">{q.title}</h3>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="p-2 rounded-full bg-[#D7F27A] text-[#0FA34E] hover:bg-[#0FA34E] hover:text-[#F6E9D2] transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-[#0FA34E]/15 space-y-3">
              {q.body && q.type !== "image" && (
                <pre className="text-xs sm:text-sm text-[#0B7C3C] font-mono leading-relaxed whitespace-pre-wrap bg-[#DFF5E6] p-4 rounded-2xl border border-[#0FA34E]/20">
                  {q.body}
                </pre>
              )}

              {q.type === "mcq" && options.length > 0 && (
                <div className="space-y-2">
                  {options.map((opt, index) => (
                    <div
                      key={`${opt}-${index}`}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold border transition-all ${
                        index === q.correct_option
                          ? "border-[#0FA34E] bg-[#0FA34E] text-[#C6FF3D]"
                          : "border-[#0FA34E]/20 bg-[#D7F27A] text-[#0FA34E]"
                      }`}
                    >
                      {index === q.correct_option ? (
                        <CheckCircle2 className="w-4 h-4 text-[#C6FF3D] shrink-0" />
                      ) : (
                        <span className="w-4 h-4 shrink-0 rounded-full border border-[#0FA34E] flex items-center justify-center text-[10px]">
                          {String.fromCharCode(65 + index)}
                        </span>
                      )}
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              )}

              {q.type === "image" && q.image_url && (
                <div className="rounded-2xl border border-[#0FA34E]/20 bg-[#DFF5E6] p-3 text-center">
                  <img src={q.image_url} alt="Question Diagram" className="max-h-72 max-w-full rounded-xl object-contain mx-auto" />
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
  const { user, isAuthenticated, login } = useAuth();
  const [company, setCompany] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  // Contribution modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    roundType: "Online Assessment (OA)",
    questionTitle: "",
    questionType: "text",
    difficulty: "Medium",
    questionBody: "",
    tags: "",
    optionsText: "Option A\nOption B\nOption C\nOption D",
    correctOption: 0,
    contributorName: "",
    contributorEmail: "",
    contributorBatch: "B.Tech CSE '25",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        contributorName: user.displayName || prev.contributorName,
        contributorEmail: user.email || prev.contributorEmail,
      }));
    }
  }, [user]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, qRes] = await Promise.all([
        getCompany(id),
        getCompanyQuestions(id),
      ]);
      if (!compRes.success) throw new Error(compRes.error || "Failed to load company");
      if (!qRes.success) throw new Error(qRes.error || "Failed to load questions");
      setCompany(compRes.data);
      setQuestions(qRes.data);
    } catch (err) {
      setError(err?.message || err?.error || "Failed to load company questions");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        search === "" ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        (q.body || "").toLowerCase().includes(search.toLowerCase()) ||
        (q.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesDiff = difficultyFilter === "all" || q.difficulty === difficultyFilter;
      return matchesSearch && matchesDiff;
    });
  }, [questions, search, difficultyFilter]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleContributeSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast("Please sign in to contribute.", "error");
      return;
    }
    if (!formData.questionTitle.trim()) {
      showToast("Please enter a question title.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        companyId: id,
        companyName: company?.name || "Target Company",
        roundType: formData.roundType,
        questionTitle: formData.questionTitle.trim(),
        questionType: formData.questionType,
        difficulty: formData.difficulty,
        questionBody: formData.questionBody.trim(),
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        options: formData.questionType === "mcq" ? formData.optionsText.split("\n").map((o) => o.trim()).filter(Boolean) : null,
        correctOption: formData.questionType === "mcq" ? Number(formData.correctOption) : null,
        image_url: formData.questionType === "image" ? formData.image_url?.trim() || null : null,
        contributorName: formData.contributorName || user?.displayName,
        contributorEmail: formData.contributorEmail || user?.email,
        contributorBatch: formData.contributorBatch,
      };

      const res = await contributeCompanyQuestion(payload);
      if (res.success) {
        setIsModalOpen(false);
        showToast("🎉 Question submitted! Admin will verify and add it to " + (company?.name || "the bank") + ".");
        setFormData((prev) => ({
          ...prev,
          questionTitle: "",
          questionBody: "",
          image_url: "",
          tags: "",
        }));
      } else {
        throw new Error(res.error || "Submission failed");
      }
    } catch (err) {
      showToast(err?.message || "Failed to submit question.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="section-container py-28 text-center" style={{ minHeight: "60vh" }}>
        <Loader2 className="w-10 h-10 animate-spin text-[#0FA34E] mx-auto mb-3" />
        <p className="font-display font-bold text-base text-[#0FA34E]">Loading verified questions...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="section-container py-28 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#E1584A] mx-auto" />
        <h2 className="font-display font-extrabold text-2xl text-[#0B7C3C]">Recruiter Details Not Found</h2>
        <p className="text-xs text-[#0B7C3C88]">{error || "Company not available"}</p>
        <Link
          to="/company-bank"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs shadow"
          style={{ background: "#0FA34E", color: "#F6E9D2" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recruiter Bank
        </Link>
      </div>
    );
  }

  return (
    <div className="section-container py-24 space-y-8 text-left relative">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-xs sm:text-sm font-bold shadow-2xl border-2 flex items-center gap-2"
            style={{
              background: toast.type === "error" ? "#E1584A" : "#0FA34E",
              color: "#F6E9D2",
              borderColor: toast.type === "error" ? "rgba(225,88,74,0.6)" : "rgba(198,255,61,0.6)",
            }}
          >
            {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-[#C6FF3D]" />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        to="/company-bank"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B7C3C] hover:opacity-75 transition-opacity"
      >
        <ArrowLeft className="w-4 h-4" />
        All Companies
      </Link>

      {/* Recruiter Header Banner */}
      <div className="bg-[#F6E9D2] border-2 border-[#0FA34E]/20 p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0FA34E] text-[#F6E9D2] font-display font-extrabold text-2xl flex items-center justify-center shadow">
            {company.logo_url ? (
              <img src={company.logo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              (company.name[0] || "?").toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#0FA34E]">{company.name}</h1>
              <span className="font-mono text-[10px] font-bold bg-[#C6FF3D] text-[#0FA34E] px-2.5 py-0.5 rounded-full border border-[#0FA34E]/20">
                Verified
              </span>
            </div>
            <p className="text-xs text-[#0B7C3C] mt-1 font-medium max-w-xl leading-relaxed">{company.description}</p>
          </div>
        </div>

        {/* Contribute button */}
        <button
          onClick={() => {
            if (!isAuthenticated) login();
            else setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-display font-extrabold text-xs sm:text-sm shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5 shrink-0"
          style={{ background: "#0FA34E", color: "#F6E9D2", border: "2px solid rgba(198, 255, 61, 0.4)" }}
        >
          <PlusCircle className="w-4 h-4 text-[#C6FF3D]" />
          <span>Contribute {company.name} Question</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0FA34E]" />
          <input
            type="text"
            placeholder="Search questions by topic, keyword, or DSA concept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#F6E9D2] border-2 border-[#0FA34E]/20 rounded-2xl text-xs sm:text-sm font-bold text-[#0FA34E] focus:outline-none focus:border-[#0FA34E] shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {["all", "Easy", "Medium", "Hard"].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold border transition-all ${
                difficultyFilter === diff
                  ? "bg-[#0FA34E] text-[#F6E9D2] border-[#0FA34E]"
                  : "bg-[#F6E9D2] text-[#0FA34E] border-[#0FA34E]/20 hover:bg-[#D7F27A]"
              }`}
            >
              {diff === "all" ? "All Difficulties" : diff}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-16 bg-[#F6E9D2] rounded-3xl border-2 border-dashed border-[#0FA34E]/30 p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-[#0FA34E] mx-auto opacity-50" />
            <h3 className="font-display font-extrabold text-lg text-[#0FA34E]">No Questions Matching Search</h3>
            <p className="text-xs text-[#0B7C3C] max-w-sm mx-auto">
              Did you encounter a question in your recent {company.name} placement drive? Click contribute above to add it!
            </p>
          </div>
        ) : (
          filteredQuestions.map((q) => <QuestionCard key={q.id} q={q} />)
        )}
      </div>

      {/* ── QUESTION CONTRIBUTION MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-5 relative bg-[#F6E9D2]"
              style={{ borderColor: "#0FA34E" }}
            >
              {/* Modal Top */}
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "rgba(15, 163, 78, 0.2)" }}>
                <div>
                  <h2 className="text-xl font-extrabold text-[#0FA34E]" style={{ fontFamily: '"Baloo 2", cursive' }}>
                    Contribute to {company.name} Question Bank ✍️
                  </h2>
                  <p className="text-xs text-[#0B7C3C] font-medium">
                    Your submission will be reviewed and published to help fellow KIIT students.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#D7F27A] text-[#0B7C3C] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleContributeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Company</label>
                    <input value={company.name} disabled style={{ ...inputStyle, opacity: 0.8 }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Placement Round *</label>
                    <select
                      value={formData.roundType}
                      onChange={(e) => setFormData({ ...formData, roundType: e.target.value })}
                      style={inputStyle}
                    >
                      <option>Online Assessment (OA)</option>
                      <option>Technical Round 1</option>
                      <option>Technical Round 2</option>
                      <option>Managerial Round</option>
                      <option>HR Interview Round</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label style={labelStyle}>Question Format</label>
                    <select
                      value={formData.questionType}
                      onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="text">Coding / Subjective</option>
                      <option value="mcq">MCQ Choice</option>
                      <option value="image">Diagram / Schema (Image URL)</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Difficulty Level</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      style={inputStyle}
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Topic Tags</label>
                    <input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="SQL, Java, DP, Trees"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Question Title / Problem Name *</label>
                  <input
                    value={formData.questionTitle}
                    onChange={(e) => setFormData({ ...formData, questionTitle: e.target.value })}
                    placeholder={`e.g. Find Second Highest Salary (${company.name} SQL OA)`}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Full Question Details, Constraints & Solution Notes</label>
                  <textarea
                    rows={formData.questionType === "image" ? 2 : 4}
                    value={formData.questionBody}
                    onChange={(e) => setFormData({ ...formData, questionBody: e.target.value })}
                    placeholder="Provide description, constraints, input/output test cases, or your cleared approach..."
                    style={inputStyle}
                  />
                </div>

                {formData.questionType === "image" && (
                  <div className="space-y-2 p-3.5 rounded-2xl border bg-[#DFF5E6]/60" style={{ borderColor: "rgba(15, 163, 78, 0.25)" }}>
                    <label style={labelStyle}>Image / Schema Diagram URL *</label>
                    <input
                      type="url"
                      value={formData.image_url || ""}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://i.imgur.com/example.png or https://..."
                      style={inputStyle}
                      required={formData.questionType === "image"}
                    />
                    <p className="text-[10px] text-[#0B7C3C88]">
                      Paste direct link of problem image, database schema diagram, or test screenshot.
                    </p>
                    {formData.image_url && (
                      <div className="mt-2 p-2 rounded-xl bg-white border border-[#0FA34E]/20 text-center">
                        <p className="text-[10px] font-bold text-[#0FA34E] mb-1">Image Preview:</p>
                        <img
                          src={formData.image_url}
                          alt="Question Diagram"
                          className="max-h-48 max-w-full rounded-lg object-contain mx-auto"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {formData.questionType === "mcq" && (
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
                    <div>
                      <label style={labelStyle}>Options (one per line)</label>
                      <textarea
                        rows={4}
                        value={formData.optionsText}
                        onChange={(e) => setFormData({ ...formData, optionsText: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Correct # (0-3)</label>
                      <input
                        type="number"
                        min="0"
                        max="3"
                        value={formData.correctOption}
                        onChange={(e) => setFormData({ ...formData, correctOption: e.target.value })}
                        style={inputStyle}
                      />
                      <p className="text-[10px] text-[#0B7C3C88] mt-1">0=Option A, 1=B</p>
                    </div>
                  </div>
                )}


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label style={labelStyle}>Your Name</label>
                    <input
                      value={formData.contributorName}
                      onChange={(e) => setFormData({ ...formData, contributorName: e.target.value })}
                      placeholder="Your Name"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Branch & Batch</label>
                    <input
                      value={formData.contributorBatch}
                      onChange={(e) => setFormData({ ...formData, contributorBatch: e.target.value })}
                      placeholder="e.g. B.Tech IT '25"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                  style={{ background: "#0FA34E", color: "#F6E9D2", fontFamily: '"Baloo 2", cursive' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting to Admin...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#C6FF3D]" />
                      <span>Submit Question to Admin</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
