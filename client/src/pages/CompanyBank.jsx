import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Building2,
  ChevronRight,
  Loader2,
  Search,
  CheckCircle2,
  PlusCircle,
  X,
  Send,
  Sparkles,
  HelpCircle,
  BookOpen
} from "lucide-react";
import { getCompanies, contributeCompanyQuestion } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import SEO from "@/components/SEO";
import PaymentModal from "@/components/payment/PaymentModal";
import { ProPaywall } from "@/components/payment/FreeTrialBadge";
import { useAccess } from "@/hooks/useAccess";

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

export default function CompanyBank() {
  const { user, isAuthenticated, login } = useAuth();
  const { hasPro, loading: accessLoading, refresh: refreshAccess } = useAccess();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paywallBlocked, setPaywallBlocked] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [search, setSearch] = useState("");

  // Contribution Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
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

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const shouldOpen = sessionStorage.getItem("openCompanyQuestionContribution");
    if (shouldOpen === "general") {
      sessionStorage.removeItem("openCompanyQuestionContribution");
      setIsModalOpen(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    getCompanies()
      .then((res) => {
        if (res.success) setCompanies(res.data);
        else setError(res.error || "Failed to load companies");
      })
      .catch((err) => {
        if (err?.code === 402) {
          setPaywallBlocked(true);
          setLoading(false);
          return;
        }
        setError(err?.message || err?.error || "Network error");
      })
      .finally(() => setLoading(false));
  }, [hasPro]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return companies;
    return companies.filter((company) =>
      company.name.toLowerCase().includes(query) ||
      (company.role || "").toLowerCase().includes(query) ||
      (company.description || "").toLowerCase().includes(query)
    );
  }, [companies, search]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenContributeModal = () => {
    setIsModalOpen(true);
  };

  const handleContributeSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      sessionStorage.setItem("openCompanyQuestionContribution", "general");
      showToast("Please sign in to submit your question.", "error");
      login();
      return;
    }
    if (!formData.questionTitle.trim()) {
      showToast("Please enter a question title.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        companyName: formData.companyName.trim() || "General KIIT Placement",
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
        showToast("🎉 Question submitted! Admin will verify and publish it.");
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

  return (
    <div className="section-container py-24 space-y-8 text-left relative">
      <SEO
        title="KIIT Company Question Bank"
        description="Verified interview questions for Microsoft, Amazon, Deloitte, HighRadius, Zscaler, PwC and 50+ KIIT campus recruiters. Curated by placed alumni to help you crack every round."
        path="/company-bank"
        keywords="KIIT company question bank, Microsoft interview questions KIIT, Amazon KIIT, HighRadius interview questions, Deloitte KIIT, campus placement questions"
      />

      {/* Pro Paywall Block */}
      {paywallBlocked && !hasPro && (
        <ProPaywall onUpgrade={() => setShowUpgradeModal(true)} />
      )}

      <PaymentModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        mode="subscription"
        user={user}
        onSuccess={() => {
          setShowUpgradeModal(false);
          setPaywallBlocked(false);
          refreshAccess();
          setLoading(true);
          getCompanies()
            .then((res) => { if (res.success) setCompanies(res.data); })
            .finally(() => setLoading(false));
        }}
      />

      {paywallBlocked && !hasPro && !isModalOpen ? null : (
        <>
      
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

      {/* Header with Top Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-block bg-[#0FA34E] text-[#C6FF3D] font-mono text-xs font-black px-3.5 py-1 rounded-full uppercase shadow">
            ★ 100% VERIFIED KIIT RECRUITER INSIGHTS
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-[#0FA34E]">
            Company Recruiter Bank
          </h1>
          <p className="text-sm font-medium text-[#0B7C3C] max-w-2xl">
            Browse question banks, round-by-round interview transcripts, and CTC packages from HighRadius, Deloitte, Microsoft, PwC, Zscaler, and 35+ top recruiters.
          </p>
        </div>

        {/* Contribution Action Button */}
        <button
          type="button"
          onClick={handleOpenContributeModal}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-display font-extrabold text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 shrink-0"
          style={{
            background: "#0FA34E",
            color: "#F6E9D2",
            border: "2px solid rgba(198, 255, 61, 0.4)",
          }}
        >
          <PlusCircle className="w-4 h-4 text-[#C6FF3D]" />
          <span>Contribute a Question ✍️</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0FA34E]" />
        <input
          type="text"
          placeholder="Search company (e.g. HighRadius, Deloitte, Microsoft)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-2xl text-xs sm:text-sm font-bold text-[#0FA34E] focus:outline-none focus:border-[#0FA34E] shadow-sm"
        />
      </div>

      {loading && (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0FA34E] mx-auto mb-2" />
          <p className="font-display font-bold text-sm text-[#0FA34E]">Loading recruiter bank...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 p-4 bg-red-100 border-2 border-red-300 rounded-2xl text-red-800 text-xs font-mono font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-[#0B7C3C] space-y-2">
          <Building2 className="w-12 h-12 mx-auto opacity-50 text-[#0FA34E]" />
          <p className="font-display font-bold text-base">No companies found matching "{search}".</p>
          <p className="text-xs font-medium">Have a question from this recruiter? Click the contribute button above to submit it!</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link
                to={`/company-bank/${company.id}`}
                className="bg-[#F6E9D2] border-2 border-[#0FA34E]/20 hover:border-[#0FA34E] p-6 rounded-3xl shadow-md hover:shadow-xl transition-all flex flex-col justify-between group h-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0FA34E] text-[#F6E9D2] font-display font-extrabold text-xl flex items-center justify-center shadow">
                      {company.logo_url ? (
                        <img src={company.logo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        (company.name[0] || "?").toUpperCase()
                      )}
                    </div>
                    <span className="font-mono text-[10px] font-bold bg-[#C6FF3D] text-[#0FA34E] px-2.5 py-1 rounded-full border border-[#0FA34E]/20">
                      KIIT '25 Verified
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-xl text-[#0FA34E] group-hover:text-[#0B7C3C] transition-colors">
                    {company.name}
                  </h3>
                  {company.role && (
                    <p className="mt-1 inline-flex items-center rounded-full bg-[#DFF5E6] px-2.5 py-1 text-[10px] font-bold text-[#0FA34E] border border-[#0FA34E]/20">
                      {company.role}
                    </p>
                  )}
                  <p className="text-xs text-[#0B7C3C] mt-2 line-clamp-2 font-medium leading-relaxed">
                    {company.description || "Round-by-round interview process, coding questions, and aptitude test transcripts."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#0FA34E]/15 flex items-center justify-between text-xs font-mono font-bold text-[#0FA34E]">
                  <span>{company.question_count || 0}+ Questions</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── QUESTION CONTRIBUTION MODAL ── */}
      {isModalOpen && createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto"
            style={{
              backgroundColor: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl max-h-[90vh] my-auto overflow-y-auto rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-5 relative bg-[#F6E9D2]"
              style={{ borderColor: "#0FA34E" }}
            >
              {/* Modal Top */}
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "rgba(15, 163, 78, 0.2)" }}>
                <div>
                  <h2 className="text-xl font-extrabold text-[#0FA34E]" style={{ fontFamily: '"Baloo 2", cursive' }}>
                    Contribute Placement Question ✍️
                  </h2>
                  <p className="text-xs text-[#0B7C3C] font-medium">
                    Help fellow KIITians! Your submitted question will be emailed to admin for verification.
                  </p>
                </div>
                <button
                  type="button"
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
                    <label style={labelStyle}>Recruiter / Company *</label>
                    <input
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. HighRadius, Deloitte, Microsoft, PwC"
                      style={inputStyle}
                      required
                    />
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
                  <label style={labelStyle}>Question Title / Problem Statement *</label>
                  <input
                    value={formData.questionTitle}
                    onChange={(e) => setFormData({ ...formData, questionTitle: e.target.value })}
                    placeholder="e.g. Find Nth Fibonacci with Matrix Exponentiation (Microsoft OA)"
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
                      Paste a direct image link (e.g. Imgur, Cloudinary, Google Drive direct link) of the question diagram, schema or problem screenshot.
                    </p>
                    {formData.image_url && (
                      <div className="mt-2 p-2 rounded-xl bg-white border border-[#0FA34E]/20 text-center">
                        <p className="text-[10px] font-bold text-[#0FA34E] mb-1">Image Preview:</p>
                        <img
                          src={formData.image_url}
                          alt="Question Preview"
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
                      placeholder="Your Name (or Anonymous)"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Your Email Address *</label>
                    <input
                      type="email"
                      value={formData.contributorEmail}
                      onChange={(e) => setFormData({ ...formData, contributorEmail: e.target.value })}
                      placeholder="student@kiit.ac.in"
                      style={inputStyle}
                      required
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
          </div>,
          document.body
        )}

      </>
      )}
    </div>
  );
}
