import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  CheckCircle2,
  Check,
  UserCheck,
  RotateCw,
  Lock,
  ChevronRight,
  Tag,
  Settings,
  Star,
  Vote,
  BarChart3,
  Plus,
  Sparkles,
  Trash2,
  Building2,
  TrendingUp,
  MessageSquarePlus,
  X,
  Award,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getDoubtSessions as fetchDoubtSessionsApi,
  bookDoubtSession as bookDoubtSessionApi,
  getDoubtPolls,
  createDoubtPoll,
  voteDoubtPoll,
  addDoubtPollOption,
  deleteDoubtPoll
} from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/SEO';

const FALLBACK_SESSIONS = [
  { id: 'doubt-1', mentor: 'SDE at Microsoft', role: 'SDE at Microsoft (₹51.0 LPA)', batch: "KIIT CSE '24 Alum", topic: 'Cracking HighRadius & Microsoft Coding & Technical Rounds', date: 'Today, 7:00 PM IST', duration: '60 Mins', totalSeats: 15, bookedSeats: 12, tags: ['DSA', 'Interview Tips', 'System Design'], avatar: 'MS', meetLink: 'https://meet.google.com/kampus-ace-doubt-1' },
  { id: 'doubt-2', mentor: 'SDE at HighRadius', role: 'SDE at HighRadius (₹18.5 LPA)', batch: "KIIT IT '24 Alum", topic: 'HighRadius OA & SQL Live Query Masterclass + Capstone Tips', date: 'Tomorrow, 6:30 PM IST', duration: '90 Mins', totalSeats: 20, bookedSeats: 16, tags: ['HighRadius', 'SQL', 'Java'], avatar: 'HR', meetLink: 'https://meet.google.com/kampus-ace-doubt-2' },
  { id: 'doubt-3', mentor: 'Consultant at Deloitte', role: 'Consultant at Deloitte USI (₹11.5 LPA)', batch: "KIIT ECE '24 Alum", topic: 'Deloitte Case Studies & AMCAT Aptitude Fast Tricks', date: 'Sat, 16 Aug - 5:00 PM', duration: '60 Mins', totalSeats: 15, bookedSeats: 11, tags: ['Deloitte', 'Aptitude', 'GD'], avatar: 'DL', meetLink: 'https://meet.google.com/kampus-ace-doubt-3' },
  { id: 'doubt-4', mentor: 'Security Engineer at Zscaler', role: 'Security Engineer at Zscaler (₹28.0 LPA)', batch: "KIIT CSE '24 Alum", topic: 'Low-Level System Design & C++ Pointers / Multithreading', date: 'Sun, 17 Aug - 4:00 PM', duration: '75 Mins', totalSeats: 12, bookedSeats: 9, tags: ['Zscaler', 'LLD', 'OS'], avatar: 'ZS', meetLink: 'https://meet.google.com/kampus-ace-doubt-4' },
  { id: 'doubt-5', mentor: 'Associate at PwC', role: 'Associate at PwC India (₹9.0 LPA)', batch: "KIIT CSSE '24 Alum", topic: 'Resume & Portfolio Review - Live 1-on-1 Grill Session', date: 'Mon, 18 Aug - 8:00 PM', duration: '60 Mins', totalSeats: 10, bookedSeats: 7, tags: ['Resume', 'HR', 'Cybersecurity'], avatar: 'PW', meetLink: 'https://meet.google.com/kampus-ace-doubt-5' },
  { id: 'doubt-6', mentor: 'SDE at Amazon', role: 'SDE at Amazon (₹45.0 LPA)', batch: "KIIT CSE '23 Alum", topic: 'Amazon Leadership Principles & DP Optimization Tricks', date: 'Tue, 19 Aug - 7:30 PM', duration: '90 Mins', totalSeats: 15, bookedSeats: 14, tags: ['Amazon', 'DP', 'Behavioral'], avatar: 'AZ', meetLink: 'https://meet.google.com/kampus-ace-doubt-6' },
];

const ADMIN_EMAILS = ['23052921@kiit.ac.in'];

export default function DoubtSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState(FALLBACK_SESSIONS);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [toast, setToast] = useState(null);

  // Polls State
  const [polls, setPolls] = useState([]);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [votingOptionId, setVotingOptionId] = useState(null);
  
  // Suggest Option State (per poll)
  const [suggestTextByPoll, setSuggestTextByPoll] = useState({});
  const [submittingOptionPollId, setSubmittingOptionPollId] = useState(null);

  // Create Poll Modal State
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollDesc, setNewPollDesc] = useState('');
  const [newPollOptionsText, setNewPollOptionsText] = useState('HighRadius - SQL & Java OA Query Drill\nMicrosoft - DSA Hard & Low-Level Design\nDeloitte USI - AMCAT Aptitude & Case Study\nAmazon - DP & Leadership Principles');
  const [creatingPoll, setCreatingPoll] = useState(false);

  const isAdmin = user && (ADMIN_EMAILS.includes(user.email?.toLowerCase()) || user.role === 'admin');


  // Fetch live doubt sessions
  const loadSessions = () => {
    setLoadingSessions(true);
    fetchDoubtSessionsApi()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setSessions(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSessions(false));
  };

  // Fetch live polls
  const loadPolls = () => {
    setLoadingPolls(true);
    getDoubtPolls()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setPolls(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPolls(false));
  };

  useEffect(() => {
    loadSessions();
    loadPolls();
  }, [user]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleBookSession = async (sessionId) => {
    if (!user) {
      showToast('Please sign in to book a session', 'error');
      return;
    }
    setBookingId(sessionId);
    try {
      const res = await bookDoubtSessionApi(sessionId);
      if (res.success) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  isBooked: res.booked,
                  meetLink: res.booked ? (res.meetLink || s.meetLink) : null,
                  bookedSeats: res.booked ? s.bookedSeats + 1 : Math.max(0, s.bookedSeats - 1),
                  remainingSeats: res.remainingSeats,
                }
              : s
          )
        );
        showToast(
          res.booked
            ? '🎉 Slot booked! Check your email for the meet link.'
            : 'Booking cancelled. Your seat has been released.'
        );
      }
    } catch {
      // Local fallback toggle
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, isBooked: !s.isBooked, bookedSeats: s.isBooked ? s.bookedSeats - 1 : s.bookedSeats + 1 }
            : s
        )
      );
      showToast('Booking updated');
    } finally {
      setBookingId(null);
    }
  };

  const handleVote = async (pollId, optionId) => {
    if (!user) {
      showToast('Please sign in to vote on sessions', 'error');
      return;
    }
    setVotingOptionId(optionId);
    try {
      const res = await voteDoubtPoll(pollId, optionId);
      if (res.success && res.data) {
        setPolls((prev) =>
          prev.map((p) =>
            p.id === pollId
              ? {
                  ...p,
                  totalVotes: res.data.totalVotes,
                  userVotedOptionId: res.data.userVotedOptionId,
                  hasVoted: res.data.hasVoted,
                  options: res.data.options,
                }
              : p
          )
        );
        showToast(res.data.hasVoted ? '🗳️ Vote recorded! Admin notified of demand.' : 'Vote removed.');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to record vote', 'error');
    } finally {
      setVotingOptionId(null);
    }
  };

  const handleAddOption = async (pollId) => {
    const text = (suggestTextByPoll[pollId] || '').trim();
    if (!text) {
      showToast('Please enter a company or topic name', 'error');
      return;
    }
    if (!user) {
      showToast('Please sign in to suggest an option', 'error');
      return;
    }
    setSubmittingOptionPollId(pollId);
    try {
      const res = await addDoubtPollOption(pollId, { optionText: text });
      if (res.success) {
        showToast('🎉 Company option added! You can now vote for it.');
        setSuggestTextByPoll((prev) => ({ ...prev, [pollId]: '' }));
        loadPolls();
      }
    } catch (err) {
      showToast(err?.message || 'Failed to add option', 'error');
    } finally {
      setSubmittingOptionPollId(null);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Admin privileges required to create polls', 'error');
      return;
    }
    if (!newPollTitle.trim()) {
      showToast('Please provide a poll title', 'error');
      return;
    }
    const options = newPollOptionsText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    if (options.length < 2) {
      showToast('Please provide at least 2 company options', 'error');
      return;
    }

    setCreatingPoll(true);
    try {
      const res = await createDoubtPoll({
        title: newPollTitle.trim(),
        description: newPollDesc.trim(),
        options,
      });
      if (res.success) {
        showToast('🎉 New session demand poll published!');
        setIsCreatePollOpen(false);
        setNewPollTitle('');
        setNewPollDesc('');
        loadPolls();
      }
    } catch (err) {
      showToast(err?.message || 'Failed to create poll', 'error');
    } finally {
      setCreatingPoll(false);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll?')) return;
    try {
      const res = await deleteDoubtPoll(pollId);
      if (res.success) {
        showToast('Poll deleted');
        setPolls((prev) => prev.filter((p) => p.id !== pollId));
      }
    } catch (err) {
      showToast(err?.message || 'Failed to delete poll', 'error');
    }
  };

  return (
    <div className="section-container py-24 space-y-16" style={{ position: 'relative' }}>
      <SEO
        title="Mentor Doubt Sessions"
        description="Book live doubt sessions with KIIT alumni placed at Microsoft, Amazon, HighRadius & Deloitte. Get personalized guidance on DSA, system design, HR rounds, and placement strategy."
        path="/doubt-sessions"
        keywords="KIIT doubt session, placement mentor session, KIIT alumni guidance, DSA doubt session, placement counseling KIIT"
      />
      
      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-bold shadow-2xl border-2"
            style={{
              background: toast.type === 'error' ? '#E1584A' : '#0FA34E',
              color: '#F6E9D2',
              borderColor: toast.type === 'error' ? '#E1584Acc' : '#D7F27Acc',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 1: HEADER & LIVE SESSIONS ─────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-mono text-xs font-bold border shadow-sm mb-3"
              style={{ background: '#F6E9D2', color: '#0FA34E', borderColor: '#0FA34E33' }}>
              <Users className="w-4 h-4" />
              <span>KIIT Alumni Peer Guidance</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold" style={{ color: '#0FA34E' }}>
              Live Alumni Doubt Clinics
            </h1>
            <p className="text-sm font-medium mt-1.5 max-w-2xl" style={{ color: '#0B7C3C' }}>
              Reserve your slot with KIIT alumni placed at Microsoft, HighRadius, Deloitte, Zscaler &amp; Amazon.
              Google Meet links are revealed and emailed automatically upon slot confirmation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/doubt-admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border-2 transition-all hover:opacity-90 shadow"
                style={{ background: '#0B7C3C', color: '#D7F27A', borderColor: '#D7F27A44' }}
              >
                <Settings className="w-4 h-4" />
                Manage Sessions (Admin)
              </Link>
            )}
          </div>
        </div>

        {/* ── Sessions Cards Grid ── */}
        {loadingSessions ? (
          <div className="py-20 text-center">
            <RotateCw className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#0FA34E' }} />
            <p className="font-bold text-sm" style={{ color: '#0FA34E' }}>Loading live doubt clinics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session, i) => {
              const seatsLeft = session.remainingSeats !== undefined
                ? session.remainingSeats
                : session.totalSeats - session.bookedSeats;
              const occupancy = Math.round(((session.totalSeats - seatsLeft) / session.totalSeats) * 100);
              const isFull = seatsLeft <= 0;
              const isBooking = bookingId === session.id;

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6, boxShadow: '0 24px 48px #0FA34E1A' }}
                  className="p-6 rounded-3xl border-2 flex flex-col justify-between gap-4 shadow-md transition-all relative overflow-hidden"
                  style={{
                    background: '#F6E9D2',
                    borderColor: session.isBooked ? '#0FA34E88' : '#0FA34E22',
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow shrink-0"
                        style={{ background: '#0FA34E', color: '#D7F27A' }}
                      >
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-black px-2 py-0.5 rounded-full bg-[#0FA34E] text-[#C6FF3D]">
                            <Sparkles className="w-2.5 h-2.5" />
                            VERIFIED ALUM
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base leading-tight truncate" style={{ fontFamily: '"Baloo 2", cursive', color: '#0FA34E' }}>
                          {session.role || session.mentor || 'Placement Mentor'}
                        </h3>
                        <p className="text-xs font-semibold truncate mt-0.5" style={{ color: '#0B7C3C' }}>
                          {session.batch || 'KIIT Alum'}
                        </p>
                      </div>
                      {session.isBooked && (
                        <span className="ml-auto shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm"
                          style={{ background: '#0FA34E', color: '#C6FF3D' }}>
                          <Check className="w-3 h-3 inline mr-0.5" />Booked
                        </span>
                      )}
                    </div>

                    {/* Topic */}
                    <div>
                      <h4 className="font-bold text-base leading-snug" style={{ color: '#0B7C3C', fontFamily: '"Baloo 2", cursive' }}>
                        {session.topic}
                      </h4>
                      <p className="text-xs font-medium mt-1.5 flex items-center gap-1.5" style={{ color: '#0B7C3C99' }}>
                        <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: '#0FA34E' }} />
                        {session.date} ({session.duration})
                      </p>
                    </div>

                    {/* Tags */}
                    {session.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {session.tags.map((tag, ti) => (
                          <span key={ti} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                            style={{ background: '#DFF5E6', color: '#0FA34E', borderColor: '#0FA34E33' }}>
                            <Tag className="w-2.5 h-2.5" />{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Seat occupancy bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span style={{ color: isFull ? '#E1584A' : occupancy >= 80 ? '#E8A33D' : '#0FA34E' }}>
                          ⚡ {isFull ? 'Session Full' : `${seatsLeft} Seats Left`}
                        </span>
                        <span style={{ color: '#0B7C3C99' }}>{session.batch}</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#0FA34E22' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${occupancy}%`,
                            background: occupancy >= 90 ? '#E1584A' : occupancy >= 70 ? '#E8A33D' : '#0FA34E',
                          }}
                        />
                      </div>
                    </div>

                    {/* Meet link reveal */}
                    <AnimatePresence>
                      {session.isBooked && session.meetLink && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3.5 rounded-2xl space-y-1 shadow-md overflow-hidden"
                          style={{ background: '#0FA34E', color: '#C6FF3D' }}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Slot Confirmed! Meet Link:</span>
                          </div>
                          <a
                            href={session.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white underline text-xs font-mono truncate block hover:text-[#D7F27A] transition-colors"
                          >
                            {session.meetLink}
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Booking Action */}
                  {!user ? (
                    <Link
                      to="/login"
                      className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-full font-extrabold text-xs transition-all hover:opacity-90 shadow"
                      style={{ background: '#0B7C3C', color: '#F6E9D2', fontFamily: '"Baloo 2", cursive' }}
                    >
                      <Lock className="w-4 h-4" />
                      Sign in to Book Slot
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleBookSession(session.id)}
                      disabled={isBooking || (isFull && !session.isBooked)}
                      className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-full font-extrabold text-xs transition-all shadow disabled:opacity-60"
                      style={{
                        background: session.isBooked ? '#0B7C3C' : isFull ? '#E1584A' : '#0FA34E',
                        color: session.isBooked ? '#C6FF3D' : '#F6E9D2',
                        fontFamily: '"Baloo 2", cursive',
                      }}
                    >
                      {isBooking ? (
                        <RotateCw className="w-4 h-4 animate-spin" />
                      ) : session.isBooked ? (
                        <><Check className="w-4 h-4" /><span>Booked ✓ (Click to Cancel)</span></>
                      ) : isFull ? (
                        <span>Session Full</span>
                      ) : (
                        <><UserCheck className="w-4 h-4" /><span>Book Slot</span></>
                      )}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── SECTION 2: DEMAND POLLS (COMPANY WISHLIST VOTING) ─────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <div className="pt-8 border-t-2 space-y-8" style={{ borderColor: 'rgba(15, 163, 78, 0.2)' }}>
        
        {/* Header & Create Poll Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-mono text-xs font-bold border shadow-sm"
              style={{ background: '#DFF5E6', color: '#0FA34E', borderColor: '#0FA34E33' }}>
              <Vote className="w-3.5 h-3.5" />
              <span>COMMUNITY DEMAND RADAR</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#0FA34E]">
              Which Company's Doubt Session Do You Want Next?
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#0B7C3C]">
              Vote for target recruiters you want guidance for. The admin &amp; placement cell schedule top-voted sessions first!
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsCreatePollOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-display font-extrabold text-xs sm:text-sm shadow-md transition-all hover:opacity-90 self-start sm:self-auto shrink-0"
              style={{ background: '#0FA34E', color: '#D7F27A', border: '1.5px solid rgba(198, 255, 61, 0.4)' }}
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>+ Create Custom Poll (Admin)</span>
            </button>
          )}
        </div>

        {/* Polls Listing */}
        {loadingPolls ? (
          <div className="py-12 text-center">
            <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0FA34E]" />
            <p className="text-xs font-bold text-[#0FA34E]">Loading community polls...</p>
          </div>
        ) : polls.length === 0 ? (
          <div className="p-8 text-center rounded-3xl border-2 bg-[#F6E9D2]" style={{ borderColor: '#0FA34E33' }}>
            <Vote className="w-10 h-10 text-[#0FA34E] mx-auto mb-2 opacity-60" />
            <h3 className="font-display font-bold text-lg text-[#0FA34E]">No Active Demand Polls Yet</h3>
            <p className="text-xs text-[#0B7C3C88] mt-1">The placement team will publish new target company demand polls shortly.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {polls.map((poll) => {
              // Find leader option
              const topOption = poll.options?.length > 0 ? poll.options[0] : null;

              return (
                <div
                  key={poll.id}
                  className="p-6 sm:p-8 rounded-3xl border-2 shadow-lg space-y-6 relative overflow-hidden"
                  style={{ background: '#F6E9D2', borderColor: 'rgba(15, 163, 78, 0.25)' }}
                >
                  {/* Top Bar / Leader Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'rgba(15, 163, 78, 0.15)' }}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10.5px] font-bold text-[#0FA34E] bg-[#DFF5E6] px-2.5 py-0.5 rounded-full border border-[#0FA34E]/20">
                          {poll.totalVotes} Total Vote{poll.totalVotes === 1 ? '' : 's'}
                        </span>
                        <span className="text-[11px] text-[#0B7C3C88] font-medium">
                          Created by <strong className="text-[#0FA34E]">{poll.creatorName}</strong>
                        </span>
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#0FA34E]">
                        {poll.title}
                      </h3>
                      {poll.description && (
                        <p className="text-xs text-[#0B7C3C] font-medium max-w-3xl">
                          {poll.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {topOption && topOption.votes > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0FA34E] text-[#C6FF3D] font-mono text-xs font-bold shadow-sm">
                          <Award className="w-3.5 h-3.5" />
                          <span>Leader: {topOption.company || topOption.text} ({topOption.percentage}%)</span>
                        </div>
                      )}
                      {(isAdmin || (user && poll.createdBy === user.id)) && (
                        <button
                          onClick={() => handleDeletePoll(poll.id)}
                          className="p-1.5 text-[#E1584A] hover:bg-red-100 rounded-xl transition-colors"
                          title="Delete Poll"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Poll Options Grid */}
                  <div className="space-y-3">
                    {poll.options?.map((opt) => {
                      const isVoted = opt.isUserVoted;
                      const isVoting = votingOptionId === opt.id;
                      const isLeader = topOption?.id === opt.id && opt.votes > 0;

                      return (
                        <div
                          key={opt.id}
                          className={`relative overflow-hidden rounded-2xl border-2 transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isVoted
                              ? 'bg-[#DFF5E6] border-[#0FA34E] shadow-sm'
                              : 'bg-white/70 hover:bg-white border-[#0FA34E]/20'
                          }`}
                        >
                          {/* Live Animated Background Fill for vote % */}
                          <div
                            className="absolute top-0 bottom-0 left-0 transition-all duration-500 pointer-events-none opacity-20"
                            style={{
                              width: `${opt.percentage}%`,
                              background: isLeader ? '#0FA34E' : '#D7F27A',
                            }}
                          />

                          {/* Option Details */}
                          <div className="relative z-10 space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {opt.company && (
                                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0FA34E] text-[#F6E9D2]">
                                  {opt.company}
                                </span>
                              )}
                              {isLeader && (
                                <span className="text-[10px] font-mono font-bold text-[#0B7C3C] bg-[#C6FF3D] px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> Top Demand
                                </span>
                              )}
                              {isVoted && (
                                <span className="text-[10px] font-mono font-extrabold text-[#0FA34E] bg-[#DFF5E6] px-2 py-0.5 rounded-md border border-[#0FA34E]/30">
                                  ✓ Your Choice
                                </span>
                              )}
                            </div>

                            <p className="font-display font-extrabold text-sm sm:text-base text-[#0B7C3C]">
                              {opt.text}
                            </p>
                          </div>

                          {/* Vote Button & Metrics */}
                          <div className="relative z-10 flex items-center justify-between sm:justify-end gap-4 shrink-0">
                            <div className="text-right">
                              <span className="font-display font-black text-base sm:text-lg text-[#0FA34E]">
                                {opt.percentage}%
                              </span>
                              <p className="text-[10px] font-mono font-bold text-[#0B7C3C88]">
                                {opt.votes} Vote{opt.votes === 1 ? '' : 's'}
                              </p>
                            </div>

                            <button
                              onClick={() => handleVote(poll.id, opt.id)}
                              disabled={isVoting}
                              className={`px-4 py-2 rounded-full font-display font-extrabold text-xs transition-all shadow-sm flex items-center gap-1.5 ${
                                isVoted
                                  ? 'bg-[#0B7C3C] text-[#C6FF3D] border border-[#0B7C3C]'
                                  : 'bg-[#0FA34E] text-[#F6E9D2] hover:opacity-90'
                              }`}
                            >
                              {isVoting ? (
                                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                              ) : isVoted ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Voted</span>
                                </>
                              ) : (
                                <>
                                  <Vote className="w-3.5 h-3.5" />
                                  <span>Vote</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Suggest / Add Another Company Option to this Poll */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                      <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0FA34E]/60" />
                      <input
                        type="text"
                        value={suggestTextByPoll[poll.id] || ''}
                        onChange={(e) =>
                          setSuggestTextByPoll({ ...suggestTextByPoll, [poll.id]: e.target.value })
                        }
                        placeholder="Can't find your target recruiter? Type company name or topic to suggest..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs font-bold text-[#0FA34E] focus:outline-none focus:border-[#0FA34E]"
                      />
                    </div>
                    <button
                      onClick={() => handleAddOption(poll.id)}
                      disabled={submittingOptionPollId === poll.id}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-2xl font-display font-extrabold text-xs bg-[#0FA34E] text-[#F6E9D2] hover:bg-[#0B7C3C] transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-60"
                    >
                      {submittingOptionPollId === poll.id ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>Suggest Option</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: CREATE CUSTOM POLL ─────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isCreatePollOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#F6E9D2] border-2 border-[#0FA34E] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#0FA34E33' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0FA34E] text-[#D7F27A] flex items-center justify-center shadow">
                    <Vote className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-[#0FA34E]">
                    Create Placement Demand Poll
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreatePollOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#0FA34E]/10 text-[#0FA34E] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePoll} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#0FA34E] mb-1">
                    Poll Question / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPollTitle}
                    onChange={(e) => setNewPollTitle(e.target.value)}
                    placeholder="e.g. Which company's technical round masterclass is urgently needed?"
                    className="w-full px-4 py-2.5 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs font-bold text-[#0FA34E] focus:outline-none focus:border-[#0FA34E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#0FA34E] mb-1">
                    Description / Context (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newPollDesc}
                    onChange={(e) => setNewPollDesc(e.target.value)}
                    placeholder="Provide details about upcoming drive dates or focus areas..."
                    className="w-full px-4 py-2 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs font-bold text-[#0FA34E] focus:outline-none focus:border-[#0FA34E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#0FA34E] mb-1">
                    Company Options (One per line) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newPollOptionsText}
                    onChange={(e) => setNewPollOptionsText(e.target.value)}
                    placeholder="HighRadius - SQL & Java OA Query Drill&#10;Microsoft - DSA Hard & Low-Level Design&#10;Deloitte USI - AMCAT & Case Study"
                    className="w-full px-4 py-2.5 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs font-bold text-[#0FA34E] focus:outline-none focus:border-[#0FA34E]"
                  />
                  <p className="text-[10px] text-[#0B7C3C88] mt-1 font-medium">
                    Tip: Enter at least 2 options. Other students can suggest additional options later.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreatePollOpen(false)}
                    className="px-5 py-2.5 rounded-full font-display font-bold text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingPoll}
                    className="px-6 py-2.5 rounded-full font-display font-extrabold text-xs bg-[#0FA34E] text-[#F6E9D2] hover:bg-[#0B7C3C] transition-all shadow-md flex items-center gap-2 disabled:opacity-60"
                  >
                    {creatingPoll ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Publish Poll</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
