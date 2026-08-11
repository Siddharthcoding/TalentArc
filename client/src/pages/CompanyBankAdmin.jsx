import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
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
import AnimatedButton from "@/components/ui/AnimatedButton";
import { cn } from "@/utils/cn";

const emptyCompany = { name: "", description: "", logo_url: "", website: "" };
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
      setNotice(selectedCompany ? "Company updated." : "Company created.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not save company"));
    } finally {
      setSaving(false);
    }
  };

  const removeCompany = async () => {
    if (!selectedCompany) return;
    if (!window.confirm(`Delete ${selectedCompany.name} and all its questions?`)) return;
    setSaving(true);
    setError(null);
    try {
      await deleteCompany(selectedCompany.id);
      setSelectedCompanyId("");
      setCompanyForm(emptyCompany);
      setQuestions([]);
      await loadCompanies();
      setNotice("Company deleted.");
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
      setError("Create or select a company before adding questions.");
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
      setNotice(editingQuestionId ? "Question updated." : "Question added.");
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
    if (!window.confirm("Delete this question?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteCompanyQuestion(questionId);
      await loadQuestions(selectedCompanyId);
      await loadCompanies();
      setNotice("Question deleted.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete question"));
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SectionWrapper className="min-h-screen pt-24 pb-16">
        <div className="max-w-xl mx-auto glass-card p-6 text-center">
          <Building2 className="w-10 h-10 mx-auto mb-3 text-indigo-500" />
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Admin sign in required</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 mb-5">
            Sign in with an admin account to manage the company question bank.
          </p>
          <AnimatedButton onClick={login}>Sign in</AnimatedButton>
        </div>
      </SectionWrapper>
    );
  }

  if (!isAdmin) {
    return (
      <SectionWrapper className="min-h-screen pt-24 pb-16">
        <div className="max-w-xl mx-auto glass-card p-6 text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-amber-500" />
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Admin access required</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Your signed-in account is not listed in ADMIN_EMAILS on the backend.
          </p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="w-full max-w-7xl mx-auto relative z-10">
        <Link
          to="/company-bank"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Public Bank
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/30 mb-3">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Question Bank Admin</span>
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white sm:text-4xl tracking-tight">
              Manage Company Banks
            </h1>
          </div>
          <AnimatedButton type="button" variant="secondary" onClick={startNewCompany}>
            <Plus className="w-4 h-4" />
            New Company
          </AnimatedButton>
        </div>

        {notice && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
            {notice}
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            <aside className="glass-card p-3 h-fit">
              <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Companies
              </div>
              <div className="space-y-1">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => setSelectedCompanyId(company.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl transition-colors",
                      selectedCompanyId === company.id
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    )}
                  >
                    <span className="block text-sm font-semibold truncate">{company.name}</span>
                    <span className="block text-xs opacity-70">{company.question_count || 0} questions</span>
                  </button>
                ))}
                {companies.length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-zinc-400">No companies yet.</p>
                )}
              </div>
            </aside>

            <main className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <motion.form onSubmit={saveCompany} className="glass-card p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {selectedCompany ? "Company Details" : "New Company"}
                    </h2>
                    {selectedCompany && (
                      <button
                        type="button"
                        onClick={removeCompany}
                        disabled={saving}
                        className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500">Name</span>
                    <input
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm((form) => ({ ...form, name: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500">Description</span>
                    <textarea
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm((form) => ({ ...form, description: e.target.value }))}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white"
                    />
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-semibold text-zinc-500">Logo URL</span>
                      <input
                        value={companyForm.logo_url}
                        onChange={(e) => setCompanyForm((form) => ({ ...form, logo_url: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-zinc-500">Website</span>
                      <input
                        value={companyForm.website}
                        onChange={(e) => setCompanyForm((form) => ({ ...form, website: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white"
                      />
                    </label>
                  </div>
                  <AnimatedButton type="submit" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Company
                  </AnimatedButton>
                </motion.form>

                <form onSubmit={saveQuestion} className="glass-card p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {editingQuestionId ? "Edit Question" : "Add Question"}
                    </h2>
                    {editingQuestionId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuestionId(null);
                          setQuestionForm(emptyQuestion);
                        }}
                        className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                        title="Cancel edit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="block">
                      <span className="text-xs font-semibold text-zinc-500">Type</span>
                      <select
                        value={questionForm.type}
                        onChange={(e) => setQuestionForm((form) => ({ ...form, type: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white"
                      >
                        <option value="text">Text</option>
                        <option value="mcq">MCQ</option>
                        <option value="image">Image</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-zinc-500">Difficulty</span>
                      <select
                        value={questionForm.difficulty}
                        onChange={(e) => setQuestionForm((form) => ({ ...form, difficulty: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white"
                      >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-zinc-500">Tags</span>
                      <input
                        value={questionForm.tagsText}
                        onChange={(e) => setQuestionForm((form) => ({ ...form, tagsText: e.target.value }))}
                        placeholder="react, frontend"
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500">Title</span>
                    <input
                      value={questionForm.title}
                      onChange={(e) => setQuestionForm((form) => ({ ...form, title: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-zinc-500">Prompt / Notes</span>
                    <textarea
                      value={questionForm.body}
                      onChange={(e) => setQuestionForm((form) => ({ ...form, body: e.target.value }))}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white"
                    />
                  </label>
                  {questionForm.type === "mcq" && (
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_150px] gap-3">
                      <label className="block">
                        <span className="text-xs font-semibold text-zinc-500">Options, one per line</span>
                        <textarea
                          value={questionForm.optionsText}
                          onChange={(e) => setQuestionForm((form) => ({ ...form, optionsText: e.target.value }))}
                          rows={4}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold text-zinc-500">Correct #</span>
                        <input
                          type="number"
                          min="0"
                          value={questionForm.correct_option}
                          onChange={(e) => setQuestionForm((form) => ({ ...form, correct_option: e.target.value }))}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white"
                        />
                        <p className="mt-2 text-xs text-zinc-400">Zero-based index.</p>
                      </label>
                    </div>
                  )}
                  {questionForm.type === "image" && (
                    <div className="space-y-3">
                      <label className="block">
                        <span className="text-xs font-semibold text-zinc-500">Viewable Image Link</span>
                        <input
                          type="url"
                          value={questionForm.image_url}
                          onChange={(e) => setQuestionForm((form) => ({ ...form, image_url: e.target.value }))}
                          placeholder="https://example.com/question-image.png"
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white"
                          required={questionForm.type === "image"}
                        />
                      </label>
                      {questionForm.image_url && (
                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-3">
                          <img
                            src={questionForm.image_url}
                            alt="Question preview"
                            className="max-h-56 max-w-full rounded-lg object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <AnimatedButton type="submit" disabled={saving || !selectedCompanyId}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingQuestionId ? "Update Question" : "Add Question"}
                  </AnimatedButton>
                </form>
              </div>

              <div className="glass-card p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {selectedCompany ? `${selectedCompany.name} Questions` : "Questions"}
                  </h2>
                  <span className="text-sm text-zinc-400">{questions.length} total</span>
                </div>
                {questions.length === 0 ? (
                  <div className="text-center py-14 text-zinc-400">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No questions yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {questions.map((question) => (
                      <div key={question.id} className="py-4 flex flex-col md:flex-row md:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                              {question.type.toUpperCase()}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                              {question.difficulty}
                            </span>
                            {(question.tags || []).map((tag) => (
                              <span key={tag} className="text-xs text-zinc-400">{tag}</span>
                            ))}
                          </div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{question.title}</p>
                          {question.body && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{question.body}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => editQuestion(question)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                            title="Edit question"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeQuestion(question.id)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
