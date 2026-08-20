import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Building2,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
  ExternalLink,
  ShieldCheck,
  Tag,
  Layers,
  Sparkles
} from "lucide-react";
import {
  addCompanyQuestion,
  createCompany,
  deleteCompany,
  deleteCompanyQuestion,
  getCompanies,
  getCompanyQuestions,
  updateCompany,
  updateCompanyQuestion,
} from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { cn } from "@/utils/cn";

const emptyCompany = { name: "", role: "", description: "", logo_url: "", website: "" };
const emptyQuestion = {
  type: "text",
  title: "",
  body: "",
  optionsText: "Option A\nOption B\nOption C\nOption D",
  correct_option: 0,
  image_url: "",
  tagsText: "",
  difficulty: "Medium",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "14px",
  border: "2px solid rgba(15, 163, 78, 0.25)",
  background: "#DFF5E6",
  color: "#0B7C3C",
  fontSize: "13px",
  fontWeight: 600,
  outline: "none",
  fontFamily: "Inter, sans-serif",
  transition: "all 0.2s ease",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  color: "#0FA34E",
  marginBottom: "5px",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  fontFamily: "Inter, sans-serif",
};

function getErrorMessage(err, fallback) {
  return err?.message || err?.error || fallback;
}

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

function toQuestionForm(question) {
  return {
    type: question.type || "text",
    title: question.title || "",
    body: question.body || "",
    optionsText: parseOptions(question.options).join("\n") || emptyQuestion.optionsText,
    correct_option: question.correct_option ?? 0,
    image_url: question.image_url || "",
    tagsText: (question.tags || []).join(", "),
    difficulty: question.difficulty || "Medium",
  };
}

function buildQuestionPayload(form) {
  const tags = form.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean);
  const options = form.optionsText.split("\n").map((opt) => opt.trim()).filter(Boolean);
  return {
    type: form.type,
    title: form.title.trim(),
    body: form.body.trim() || null,
    options: form.type === "mcq" ? options : null,
    correct_option: form.type === "mcq" ? Number(form.correct_option) : null,
    image_url: form.type === "image" ? form.image_url.trim() : null,
    tags,
    difficulty: form.difficulty,
  };
}

export default function CompanyBankAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user, login } = useAuth();
  const isAdmin = isAuthenticated && user?.isAdmin;

  const [companies, setCompanies] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(searchParams.get("company") || "");
  const [companyForm, setCompanyForm] = useState(emptyCompany);
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId),
    [companies, selectedCompanyId]
  );

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCompanies();
      if (!res.success) throw new Error(res.error || "Failed to load companies");
      setCompanies(res.data);
      if (!selectedCompanyId && res.data.length) setSelectedCompanyId(res.data[0].id);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load companies"));
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId]);

  const loadQuestions = useCallback(async (companyId) => {
    if (!companyId) {
      setQuestions([]);
      return;
    }
    try {
      const res = await getCompanyQuestions(companyId);
      if (!res.success) throw new Error(res.error || "Failed to load questions");
      setQuestions(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load questions"));
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    if (!selectedCompanyId) return;
    setSearchParams({ company: selectedCompanyId });
    loadQuestions(selectedCompanyId);
  }, [loadQuestions, selectedCompanyId, setSearchParams]);

  useEffect(() => {
    if (selectedCompany) {
      setCompanyForm({
        name: selectedCompany.name || "",
        role: selectedCompany.role || "",
        description: selectedCompany.description || "",
        logo_url: selectedCompany.logo_url || "",
        website: selectedCompany.website || "",
      });
    } else {
      setCompanyForm(emptyCompany);
    }
    setEditingQuestionId(null);
    setQuestionForm(emptyQuestion);
  }, [selectedCompany]);

  const saveCompany = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload = {
        name: companyForm.name.trim(),
        role: companyForm.role.trim(),
        description: companyForm.description.trim() || null,
        logo_url: companyForm.logo_url.trim() || null,
        website: companyForm.website.trim() || null,
      };
      const res = selectedCompany
        ? await updateCompany(selectedCompany.id, payload)
        : await createCompany(payload);
      if (!res.success) throw new Error(res.error || "Could not save company");
      await loadCompanies();
      setSelectedCompanyId(res.data.id);
      setNotice(selectedCompany ? "Company details updated successfully." : "Company created successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not save company"));
    } finally {
      setSaving(false);
    }
  };

  const removeCompany = async () => {
    if (!selectedCompany) return;
    if (!window.confirm(`Delete ${selectedCompany.name} and all associated placement round questions?`)) return;
    setSaving(true);
    setError(null);
    try {
      await deleteCompany(selectedCompany.id);
      setSelectedCompanyId("");
      setCompanyForm(emptyCompany);
      setQuestions([]);
      await loadCompanies();
      setNotice("Company deleted successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete company"));
    } finally {
      setSaving(false);
    }
  };

  const startNewCompany = () => {
    setSelectedCompanyId("");
    setCompanyForm(emptyCompany);
    setQuestions([]);
    setEditingQuestionId(null);
    setQuestionForm(emptyQuestion);
    setSearchParams({});
  };

  const saveQuestion = async (event) => {
    event.preventDefault();
    if (!selectedCompanyId) {
      setError("Please select or create a recruiter entry first.");
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload = buildQuestionPayload(questionForm);
      const res = editingQuestionId
        ? await updateCompanyQuestion(editingQuestionId, payload)
        : await addCompanyQuestion(selectedCompanyId, payload);
      if (!res.success) throw new Error(res.error || "Could not save question");
      await loadQuestions(selectedCompanyId);
      await loadCompanies();
      setEditingQuestionId(null);
      setQuestionForm(emptyQuestion);
      setNotice(editingQuestionId ? "Question updated successfully." : "Question added successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not save question"));
    } finally {
      setSaving(false);
    }
  };

  const editQuestion = (question) => {
    setEditingQuestionId(question.id);
    setQuestionForm(toQuestionForm(question));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeQuestion = async (questionId) => {
    if (!window.confirm("Delete this question from the bank?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteCompanyQuestion(questionId);
      await loadQuestions(selectedCompanyId);
      await loadCompanies();
      setNotice("Question removed from bank.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete question"));
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SectionWrapper className="min-h-screen pt-28 pb-16 flex items-center justify-center" style={{ background: "#D7F27A" }}>
        <div className="max-w-md w-full p-8 rounded-3xl border-2 text-center shadow-xl space-y-4"
          style={{ background: "#F6E9D2", borderColor: "rgba(15, 163, 78, 0.3)" }}>
          <div className="w-14 h-14 rounded-2xl bg-[#0FA34E] text-[#F6E9D2] flex items-center justify-center mx-auto shadow">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-[#0FA34E]">Admin Sign In Required</h1>
          <p className="text-sm font-medium text-[#0B7C3C] leading-relaxed">
            Sign in with an authorized KIIT admin account to manage recruiter question banks and interview rounds.
          </p>
          <button
            onClick={login}
            className="w-full py-3.5 rounded-full font-bold text-sm shadow-md transition-all hover:opacity-90 mt-2"
            style={{ background: "#0FA34E", color: "#F6E9D2", fontFamily: '"Baloo 2", cursive' }}
          >
            Sign In with Google
          </button>
        </div>
      </SectionWrapper>
    );
  }

  if (!isAdmin) {
    return (
      <SectionWrapper className="min-h-screen pt-28 pb-16 flex items-center justify-center" style={{ background: "#D7F27A" }}>
        <div className="max-w-md w-full p-8 rounded-3xl border-2 text-center shadow-xl space-y-4"
          style={{ background: "#F6E9D2", borderColor: "rgba(225, 88, 74, 0.3)" }}>
          <div className="w-14 h-14 rounded-2xl bg-[#E1584A] text-[#F6E9D2] flex items-center justify-center mx-auto shadow">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-[#0B7C3C]">Admin Access Required</h1>
          <p className="text-sm font-medium text-[#0B7C3C] leading-relaxed">
            Your signed-in account (<strong className="text-[#0FA34E]">{user?.email}</strong>) is not listed in backend admin permissions.
          </p>
          <Link
            to="/company-bank"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-xs shadow transition-all hover:opacity-90"
            style={{ background: "#0FA34E", color: "#F6E9D2" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Company Bank
          </Link>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper className="min-h-screen pt-24 pb-16 relative overflow-hidden" style={{ background: "#D7F27A" }}>
      {/* Konark background watermark */}
      <div className="absolute top-10 right-10 w-96 h-96 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #0FA34E 2px, transparent 2px)", backgroundSize: "20px 20px" }} />

      <div className="w-full max-w-7xl mx-auto relative z-10 space-y-6">
        
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/company-bank"
              className="inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-75 mb-2"
              style={{ color: "#0B7C3C" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Public Recruiter Bank
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow"
                style={{ background: "#0FA34E", color: "#D7F27A", fontFamily: '"Baloo 2", cursive' }}>
                KA
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-4xl font-extrabold" style={{ color: "#0FA34E" }}>
                  Company Bank Admin
                </h1>
                <p className="text-xs font-medium" style={{ color: "#0B7C3C" }}>
                  Add, edit & curate verified placement questions, schemas, and interview transcripts.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={startNewCompany}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs shadow-md transition-all hover:opacity-90 shrink-0"
            style={{ background: "#0FA34E", color: "#D7F27A", border: "1.5px solid rgba(198,255,61,0.4)" }}
          >
            <Plus className="w-4 h-4" />
            Add New Recruiter
          </button>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold shadow border"
              style={{ background: "#DFF5E6", color: "#0FA34E", borderColor: "rgba(15, 163, 78, 0.3)" }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notice}</span>
              <button onClick={() => setNotice(null)} className="ml-auto text-xs font-bold opacity-70 hover:opacity-100">Dismiss</button>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold shadow border"
              style={{ background: "#FEE2E2", color: "#E1584A", borderColor: "rgba(225, 88, 74, 0.3)" }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-xs font-bold opacity-70 hover:opacity-100">Dismiss</button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#0FA34E" }} />
            <p className="text-xs font-bold text-[#0B7C3C]">Loading recruiter banks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            
            {/* Sidebar: Companies Directory */}
            <aside className="p-4 rounded-3xl border-2 shadow-md h-fit space-y-3"
              style={{ background: "#F6E9D2", borderColor: "rgba(15, 163, 78, 0.22)" }}>
              <div className="flex items-center justify-between px-2 pb-2 border-b" style={{ borderColor: "rgba(15, 163, 78, 0.15)" }}>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0FA34E]">
                  Recruiters ({companies.length})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#DFF5E6", color: "#0FA34E" }}>
                  Verified
                </span>
              </div>

              <div className="space-y-1 max-h-[560px] overflow-y-auto pr-1">
                {companies.map((company) => {
                  const isSelected = selectedCompanyId === company.id;
                  return (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => setSelectedCompanyId(company.id)}
                      className={cn(
                        "w-full text-left px-3.5 py-2.5 rounded-2xl transition-all flex items-center justify-between gap-2 border",
                        isSelected
                          ? "shadow-sm"
                          : "hover:bg-[#D7F27A]/50 border-transparent"
                      )}
                      style={{
                        background: isSelected ? "#0FA34E" : "transparent",
                        color: isSelected ? "#F6E9D2" : "#0B7C3C",
                        borderColor: isSelected ? "#0FA34E" : "transparent",
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-extrabold truncate" style={{ fontFamily: '"Baloo 2", cursive' }}>
                          {company.name}
                        </span>
                        <span className="block text-[10px] font-medium opacity-80">
                          {company.role || "General"} · {company.question_count || 0} questions
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-[#C6FF3D] shrink-0" />
                      )}
                    </button>
                  );
                })}
                {companies.length === 0 && (
                  <p className="px-3 py-8 text-center text-xs font-medium text-[#0B7C3C88]">
                    No companies created yet.
                  </p>
                )}
              </div>
            </aside>

            {/* Main Form & Questions Area */}
            <main className="space-y-6">
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* 1. Recruiter Meta Form */}
                <motion.form
                  onSubmit={saveCompany}
                  className="p-6 rounded-3xl border-2 shadow-md space-y-4"
                  style={{ background: "#F6E9D2", borderColor: "rgba(15, 163, 78, 0.22)" }}
                >
                  <div className="flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "rgba(15, 163, 78, 0.15)" }}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#0FA34E]" />
                      <h2 className="text-base font-extrabold text-[#0B7C3C]" style={{ fontFamily: '"Baloo 2", cursive' }}>
                        {selectedCompany ? `Edit: ${selectedCompany.name}` : "Create New Recruiter Entry"}
                      </h2>
                    </div>
                    {selectedCompany && (
                      <button
                        type="button"
                        onClick={removeCompany}
                        disabled={saving}
                        className="p-2 rounded-xl text-[#E1584A] bg-[#E1584A15] hover:bg-[#E1584A25] transition-colors"
                        title="Delete this company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>Company / Recruiter Name *</label>
                    <input
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm((form) => ({ ...form, name: e.target.value }))}
                      style={inputStyle}
                      placeholder="e.g. HighRadius Corporation, Deloitte USI, Microsoft"
                      required
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Hiring Role *</label>
                    <input
                      value={companyForm.role}
                      onChange={(e) => setCompanyForm((form) => ({ ...form, role: e.target.value }))}
                      style={inputStyle}
                      placeholder="e.g. SDE, Data Analyst, Consultant, Product Intern"
                      required
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Role-Specific Placement Process / Round Description</label>
                    <textarea
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm((form) => ({ ...form, description: e.target.value }))}
                      rows={3}
                      style={inputStyle}
                      placeholder="e.g. Round 1: OA (DSA + SQL + Aptitude), Round 2: Tech Interview (Java/Spring), Round 3: HR Grill."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Logo Image URL</label>
                      <input
                        value={companyForm.logo_url}
                        onChange={(e) => setCompanyForm((form) => ({ ...form, logo_url: e.target.value }))}
                        style={inputStyle}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Official Careers / Website</label>
                      <input
                        value={companyForm.website}
                        onChange={(e) => setCompanyForm((form) => ({ ...form, website: e.target.value }))}
                        style={inputStyle}
                        placeholder="https://company.com/careers"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs shadow-md transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: "#0FA34E", color: "#F6E9D2", fontFamily: '"Baloo 2", cursive' }}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {selectedCompany ? "Update Company Details" : "Create Recruiter Entry"}
                  </button>
                </motion.form>

                {/* 2. Question Form */}
                <form
                  onSubmit={saveQuestion}
                  className="p-6 rounded-3xl border-2 shadow-md space-y-4"
                  style={{ background: "#F6E9D2", borderColor: "rgba(15, 163, 78, 0.22)" }}
                >
                  <div className="flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "rgba(15, 163, 78, 0.15)" }}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#0FA34E]" />
                      <h2 className="text-base font-extrabold text-[#0B7C3C]" style={{ fontFamily: '"Baloo 2", cursive' }}>
                        {editingQuestionId ? "Edit Question" : "Add Placement Question"}
                      </h2>
                    </div>
                    {editingQuestionId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuestionId(null);
                          setQuestionForm(emptyQuestion);
                        }}
                        className="p-1.5 rounded-lg text-[#0B7C3C] hover:bg-[#D7F27A] transition-colors"
                        title="Cancel edit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label style={labelStyle}>Type</label>
                      <select
                        value={questionForm.type}
                        onChange={(e) => setQuestionForm((form) => ({ ...form, type: e.target.value }))}
                        style={inputStyle}
                      >
                        <option value="text">Subjective / Coding</option>
                        <option value="mcq">MCQ Choice</option>
                        <option value="image">Image / Schema</option>
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Difficulty</label>
                      <select
                        value={questionForm.difficulty}
                        onChange={(e) => setQuestionForm((form) => ({ ...form, difficulty: e.target.value }))}
                        style={inputStyle}
                      >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Tags</label>
                      <input
                        value={questionForm.tagsText}
                        onChange={(e) => setQuestionForm((form) => ({ ...form, tagsText: e.target.value }))}
                        placeholder="SQL, Java, DP, LLD"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Question Title *</label>
                    <input
                      value={questionForm.title}
                      onChange={(e) => setQuestionForm((form) => ({ ...form, title: e.target.value }))}
                      style={inputStyle}
                      placeholder="e.g. Find Second Highest Salary in HighRadius SQL OA"
                      required
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Full Question Body / Prompt / Solution Notes</label>
                    <textarea
                      value={questionForm.body}
                      onChange={(e) => setQuestionForm((form) => ({ ...form, body: e.target.value }))}
                      rows={3}
                      style={inputStyle}
                      placeholder="Enter detailed problem description, test cases, and solution code..."
                    />
                  </div>

                  {questionForm.type === "mcq" && (
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
                      <div>
                        <label style={labelStyle}>Options (one per line)</label>
                        <textarea
                          value={questionForm.optionsText}
                          onChange={(e) => setQuestionForm((form) => ({ ...form, optionsText: e.target.value }))}
                          rows={4}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Correct # (0-based)</label>
                        <input
                          type="number"
                          min="0"
                          value={questionForm.correct_option}
                          onChange={(e) => setQuestionForm((form) => ({ ...form, correct_option: e.target.value }))}
                          style={inputStyle}
                        />
                        <p className="mt-1 text-[10px] text-[#0B7C3C88]">0 = 1st option, 1 = 2nd</p>
                      </div>
                    </div>
                  )}

                  {questionForm.type === "image" && (
                    <div className="space-y-2">
                      <label style={labelStyle}>Image URL</label>
                      <input
                        type="url"
                        value={questionForm.image_url}
                        onChange={(e) => setQuestionForm((form) => ({ ...form, image_url: e.target.value }))}
                        placeholder="https://example.com/schema.png"
                        style={inputStyle}
                        required={questionForm.type === "image"}
                      />
                      {questionForm.image_url && (
                        <div className="rounded-2xl border p-2 bg-[#DFF5E6]" style={{ borderColor: "rgba(15, 163, 78, 0.25)" }}>
                          <img
                            src={questionForm.image_url}
                            alt="Question preview"
                            className="max-h-40 max-w-full rounded-xl object-contain mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving || !selectedCompanyId}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs shadow-md transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: "#0FA34E", color: "#D7F27A", fontFamily: '"Baloo 2", cursive' }}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingQuestionId ? "Update Question in Bank" : "Save Question to Recruiter Bank"}
                  </button>
                </form>
              </div>

              {/* Questions List for Selected Recruiter */}
              <div className="p-6 rounded-3xl border-2 shadow-md space-y-4"
                style={{ background: "#F6E9D2", borderColor: "rgba(15, 163, 78, 0.22)" }}>
                <div className="flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "rgba(15, 163, 78, 0.15)" }}>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#0FA34E]" />
                    <h2 className="text-base font-extrabold text-[#0B7C3C]" style={{ fontFamily: '"Baloo 2", cursive' }}>
                      {selectedCompany ? `${selectedCompany.name} Question Bank` : "Questions"}
                    </h2>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full border"
                    style={{ background: "#DFF5E6", color: "#0FA34E", borderColor: "rgba(15, 163, 78, 0.25)" }}>
                    {questions.length} total questions
                  </span>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-16 text-[#0B7C3C88] space-y-2">
                    <BookOpen className="w-12 h-12 mx-auto opacity-40 text-[#0FA34E]" />
                    <p className="text-sm font-bold">No questions added yet for this recruiter.</p>
                    <p className="text-xs">Use the form above to add coding problems, SQL queries, or MCQ rounds.</p>
                  </div>
                ) : (
                  <div className="divide-y space-y-3" style={{ borderColor: "rgba(15, 163, 78, 0.12)" }}>
                    {questions.map((question) => (
                      <div key={question.id} className="pt-3 flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                              style={{ background: "#0FA34E", color: "#F6E9D2" }}>
                              {question.type.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                              style={{
                                background: question.difficulty === "Hard" ? "#FEE2E2" : question.difficulty === "Medium" ? "#FEF3C7" : "#DFF5E6",
                                color: question.difficulty === "Hard" ? "#E1584A" : question.difficulty === "Medium" ? "#D97706" : "#0FA34E",
                                borderColor: "currentColor"
                              }}>
                              {question.difficulty}
                            </span>
                            {(question.tags || []).map((tag) => (
                              <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#D7F27A] text-[#0B7C3C]">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm font-extrabold text-[#0B7C3C]">{question.title}</p>
                          {question.body && (
                            <p className="text-xs text-[#0B7C3C88] line-clamp-2 leading-relaxed">{question.body}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => editQuestion(question)}
                            className="p-2 rounded-xl border transition-colors hover:bg-[#D7F27A]"
                            style={{ borderColor: "rgba(15, 163, 78, 0.3)", color: "#0FA34E", background: "#DFF5E6" }}
                            title="Edit question"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeQuestion(question.id)}
                            className="p-2 rounded-xl border transition-colors hover:bg-red-100"
                            style={{ borderColor: "rgba(225, 88, 74, 0.3)", color: "#E1584A", background: "#FEE2E2" }}
                            title="Delete question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </main>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
