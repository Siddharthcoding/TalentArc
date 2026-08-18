import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, Users, ChevronDown, ChevronUp,
  X, RotateCw, CheckCircle2, Eye, Link2, ArrowLeft,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getDoubtSessions,
  adminCreateDoubtSession,
  adminUpdateDoubtSession,
  adminDeleteDoubtSession,
  adminGetSessionBookings,
} from '@/services/api';
import { useAuth } from '@/context/AuthContext';


const EMPTY_FORM = {
  mentor: '', role: '', batch: '', topic: '',
  session_date: '', duration: '60 Mins',
  total_seats: 20, tags: '', avatar: '', meet_link: '',
};

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '12px',
  border: '1.5px solid #0FA34E44', background: '#DFF5E6',
  color: '#0B7C3C', fontSize: '13px', fontWeight: 600, outline: 'none',
  fontFamily: 'Inter, sans-serif',
};

const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#0B7C3C', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px',
};

export default function DoubtSessionAdmin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedBookings, setExpandedBookings] = useState({});
  const [bookingsData, setBookingsData] = useState({});
  const [loadingBookings, setLoadingBookings] = useState({});

  const isAdmin = Boolean(user?.isAdmin);

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/doubt-sessions');
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => { loadSessions(); }, []);

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showForm]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await getDoubtSessions();
      if (res.success) setSessions(res.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (session) => {
    setEditingId(session.id);
    setForm({
      mentor: session.mentor,
      role: session.role,
      batch: session.batch,
      topic: session.topic,
      session_date: session.date,
      duration: session.duration,
      total_seats: session.totalSeats,
      tags: Array.isArray(session.tags) ? session.tags.join(', ') : session.tags || '',
      avatar: session.avatar,
      meet_link: session.meetLink || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, total_seats: Number(form.total_seats) };
      let res;
      if (editingId) {
        res = await adminUpdateDoubtSession(editingId, payload);
        showToast('✅ Session updated successfully!');
      } else {
        res = await adminCreateDoubtSession(payload);
        showToast('✅ New session created!');
      }
      if (res.success) {
        await loadSessions();
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      showToast(err?.message || 'Failed to save session', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, mentorName) => {
    if (!window.confirm(`Delete ${mentorName}'s session? This will also remove all bookings.`)) return;
    try {
      await adminDeleteDoubtSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      showToast('Session deleted');
    } catch {
      showToast('Failed to delete session', 'error');
    }
  };

  const toggleBookings = async (sessionId) => {
    if (expandedBookings[sessionId]) {
      setExpandedBookings((prev) => ({ ...prev, [sessionId]: false }));
      return;
    }
    setExpandedBookings((prev) => ({ ...prev, [sessionId]: true }));
    if (!bookingsData[sessionId]) {
      setLoadingBookings((prev) => ({ ...prev, [sessionId]: true }));
      try {
        const res = await adminGetSessionBookings(sessionId);
        if (res.success) setBookingsData((prev) => ({ ...prev, [sessionId]: res.data }));
      } catch {}
      finally { setLoadingBookings((prev) => ({ ...prev, [sessionId]: false })); }
    }
  };

  if (authLoading) {
    return (
      <div className="section-container py-24 flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <RotateCw className="w-8 h-8 animate-spin" style={{ color: '#0FA34E' }} />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="section-container py-24 space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-bold shadow-2xl"
            style={{ background: toast.type === 'error' ? '#E1584A' : '#0FA34E', color: '#F6E9D2' }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link to="/doubt-sessions" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-3 hover:opacity-70 transition-opacity"
            style={{ color: '#0B7C3C' }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Sessions
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-mono text-xs font-bold border shadow-sm mb-2 ml-4"
            style={{ background: '#F6E9D2', color: '#0FA34E', borderColor: '#0FA34E33' }}>
            <Users className="w-4 h-4" />Admin Panel
          </div>
          <h1 className="font-display text-3xl font-extrabold" style={{ color: '#0FA34E' }}>
            Manage Doubt Sessions
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: '#0B7C3C' }}>
            Add, edit, or remove mentor sessions. Assign meet links — enrolled students are emailed automatically.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:opacity-90 shadow-md"
          style={{ background: '#0FA34E', color: '#D7F27A' }}
        >
          <Plus className="w-4 h-4" />
          Add New Session
        </button>
      </div>

      {/* ── Create/Edit Form Modal ── */}
      <AnimatePresence>
        {showForm && createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto"
            style={{
              backgroundColor: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-[#F6E9D2] border-2 border-[#0FA34E] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 relative my-auto max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#0FA34E33' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0FA34E] text-[#D7F27A] flex items-center justify-center shadow">
                    <Users className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-extrabold text-xl text-[#0FA34E]">
                    {editingId ? 'Edit Doubt Session' : 'Create New Doubt Session'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1.5 rounded-full hover:bg-[#0FA34E]/10 text-[#0FA34E] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>


              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ['mentor', 'Mentor Name *'],
                    ['role', 'Mentor Role (e.g. Placed at TCS ₹7LPA)'],
                    ['batch', "Batch (e.g. KIIT CSE '24 Alum)"],
                    ['avatar', 'Avatar Initials (e.g. AS — auto-generated if blank)'],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label style={labelStyle}>{label}</label>
                      <input name={field} value={form[field]} onChange={handleFormChange} style={inputStyle} placeholder={label} />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={labelStyle}>Session Topic *</label>
                  <input name="topic" value={form.topic} onChange={handleFormChange} style={inputStyle}
                    placeholder="e.g. Cracking HighRadius Technical Rounds" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label style={labelStyle}>Date & Time *</label>
                    <input name="session_date" value={form.session_date} onChange={handleFormChange} style={inputStyle}
                      placeholder="e.g. Today, 7:00 PM IST" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Duration</label>
                    <input name="duration" value={form.duration} onChange={handleFormChange} style={inputStyle}
                      placeholder="e.g. 60 Mins" />
                  </div>
                  <div>
                    <label style={labelStyle}>Total Seats</label>
                    <input name="total_seats" type="number" min="1" value={form.total_seats} onChange={handleFormChange} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Tags (comma-separated)</label>
                  <input name="tags" value={form.tags} onChange={handleFormChange} style={inputStyle}
                    placeholder="e.g. DSA, SQL, Behavioral" />
                </div>

                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Link2 className="w-3 h-3" />
                    Google Meet Link (sent to students upon booking)
                  </label>
                  <input name="meet_link" value={form.meet_link} onChange={handleFormChange} style={inputStyle}
                    placeholder="https://meet.google.com/xxx-yyyy-zzz" />
                  <p className="text-[11px] mt-1" style={{ color: '#0B7C3C88' }}>
                    💡 If you update this link later, all enrolled students will be emailed the new link automatically.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-full font-bold text-sm transition-all disabled:opacity-60 shadow-md mt-2"
                  style={{ background: '#0FA34E', color: '#D7F27A' }}
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Session' : 'Create Session'}
                </button>
              </form>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>


      {/* ── Sessions List ── */}
      {loading ? (
        <div className="py-20 text-center">
          <RotateCw className="w-8 h-8 animate-spin mx-auto" style={{ color: '#0FA34E' }} />
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.length === 0 && (
            <div className="py-16 text-center rounded-3xl border-2 border-dashed" style={{ borderColor: '#0FA34E44' }}>
              <p className="font-bold" style={{ color: '#0B7C3C88' }}>No sessions yet. Create one above!</p>
            </div>
          )}

          {sessions.map((session) => {
            const isExpanded = expandedBookings[session.id];
            const bookings = bookingsData[session.id] || [];
            const isLoadingB = loadingBookings[session.id];
            const occupancy = Math.round((session.bookedSeats / session.totalSeats) * 100);

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border-2 overflow-hidden shadow"
                style={{ background: '#F6E9D2', borderColor: '#0FA34E22' }}
              >
                {/* Session row */}
                <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-extrabold shrink-0"
                      style={{ background: '#0FA34E', color: '#D7F27A', fontFamily: '"Baloo 2", cursive' }}>
                      {session.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold" style={{ color: '#0FA34E', fontFamily: '"Baloo 2", cursive' }}>
                          {session.mentor}
                        </h3>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: '#DFF5E6', color: '#0FA34E' }}>
                          {session.bookedSeats}/{session.totalSeats} booked
                        </span>
                        {/* Mini progress */}
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#0FA34E22' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${occupancy}%`,
                            background: occupancy >= 90 ? '#E1584A' : occupancy >= 70 ? '#E8A33D' : '#0FA34E'
                          }} />
                        </div>
                      </div>
                      <p className="text-sm font-semibold truncate" style={{ color: '#0B7C3C' }}>{session.topic}</p>
                      <p className="text-xs" style={{ color: '#0B7C3C99' }}>{session.date} · {session.duration}</p>
                      {session.meetLink && (
                        <a href={session.meetLink} target="_blank" rel="noopener noreferrer"
                          className="text-xs underline truncate block hover:opacity-70 transition-opacity" style={{ color: '#0FA34E' }}>
                          {session.meetLink}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleBookings(session.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all"
                      style={{ borderColor: '#0FA34E33', color: '#0FA34E', background: '#DFF5E6' }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {session.bookedSeats}
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => openEditForm(session)}
                      title="Edit"
                      className="p-2 rounded-xl border transition-all hover:opacity-70"
                      style={{ borderColor: '#0FA34E33', color: '#0FA34E', background: '#DFF5E6' }}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id, session.mentor)}
                      title="Delete"
                      className="p-2 rounded-xl border transition-all hover:opacity-70"
                      style={{ borderColor: '#E1584A33', color: '#E1584A', background: '#E1584A12' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bookings Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t" style={{ borderColor: '#0FA34E22' }}>
                        <h4 className="text-xs font-bold uppercase tracking-widest my-3" style={{ color: '#0B7C3C99' }}>
                          Enrolled Students ({bookings.length})
                        </h4>
                        {isLoadingB ? (
                          <div className="py-4 text-center">
                            <RotateCw className="w-5 h-5 animate-spin inline" style={{ color: '#0FA34E' }} />
                          </div>
                        ) : bookings.length === 0 ? (
                          <p className="text-xs" style={{ color: '#0B7C3C88' }}>No bookings yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {bookings.map((b) => (
                              <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-2xl"
                                style={{ background: '#DFF5E6' }}>
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                                  style={{ background: '#0FA34E', color: '#D7F27A' }}>
                                  {(b.display_name || '?').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold truncate" style={{ color: '#0B7C3C' }}>{b.display_name}</p>
                                  <p className="text-[10px]" style={{ color: '#0B7C3C88' }}>{b.email}</p>
                                </div>
                                <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: '#0FA34E' }} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
