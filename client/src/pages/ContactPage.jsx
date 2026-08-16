import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, MapPin, Clock, Send, MessageSquare, HelpCircle,
  CheckCircle2, AlertCircle, ChevronDown, Sparkles, Loader2, PhoneCall
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { submitContactForm } from '@/services/api';
import SEO from '@/components/SEO';

const CATEGORIES = [
  'Placement Preparation Query',
  'Doubt Clearing Session Help',
  'Company Question Bank Suggestion',
  'Report a Bug / Technical Issue',
  'Alumni Mentor Application',
  'General Feedback & Suggestions',
];

const FAQS = [
  {
    q: 'How do the 1-on-1 alumni doubt clearing sessions work?',
    a: 'Alumni placed at top tech companies (Microsoft, Amazon, Deloitte, HighRadius, Zscaler, etc.) host live Google Meet sessions. You can reserve your seat directly from the Doubt Sessions page. Once booked, your meeting link and details are confirmed instantly and sent to your email.'
  },
  {
    q: 'How are ATS and JD Match scores calculated?',
    a: 'Our engine extracts keywords, skill density, technical competencies, experience depth, and formatting compatibility directly from your resume against target job descriptions and recruiters\' screening filters.'
  },
  {
    q: 'Can I contribute questions from my recent campus placement drive?',
    a: 'Yes! You can contribute questions anytime from the Company Bank page. Submitted questions are reviewed by our team and published to help fellow KIITians prepare for upcoming drive rounds.'
  },
  {
    q: 'Are mock test assessments timed and proctored?',
    a: 'Yes, our mock tests include full-screen monitoring, tab-switch violation tracking, and strict time limits to simulate real OA testing environments.'
  }
];

export default function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Placement Preparation Query',
    subject: '',
    message: '',
  });

  const [openFaq, setOpenFaq] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, msg: '' });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.message.trim()) {
      setStatus({ type: 'error', msg: 'Please provide both your email and message.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: null, msg: '' });

    try {
      const res = await submitContactForm(formData);
      if (res.success) {
        setStatus({
          type: 'success',
          msg: '🎉 Message delivered! The Kampus Ace team will get back to your email shortly.'
        });
        setFormData((prev) => ({
          ...prev,
          subject: '',
          message: '',
        }));
      } else {
        throw new Error(res.error || 'Failed to send message.');
      }
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err?.response?.data?.error || err?.message || 'Failed to send message. Please try again or email us directly at kampusace@gmail.com'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    background: '#FFFFFF',
    border: '2px solid rgba(15, 163, 78, 0.25)',
    color: '#0B7C3C',
    borderRadius: '12px',
    padding: '12px 16px',
    width: '100%',
    outline: 'none',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 800,
    color: '#0B7C3C',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  return (
    <div className="min-h-screen bg-[#F6E9D2] pt-28 pb-20 select-none">
      <SEO
        title="Help & Contact Us - Kampus Ace"
        description="Need placement guidance, doubt clearing assistance, or have feedback? Contact the Kampus Ace KIIT student support team."
        path="/contact"
      />

      <div className="section-container max-w-6xl mx-auto px-4 space-y-12">
        {/* Header Title Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0FA34E]/10 border border-[#0FA34E]/25 text-[#0FA34E] text-xs font-bold font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Support &amp; Community Helpdesk
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0FA34E] tracking-tight font-display">
            How can we help you crack your drive?
          </h1>
          <p className="text-sm sm:text-base text-[#0B7C3C] font-medium leading-relaxed">
            Have questions regarding placement drives, 1-on-1 mentor sessions, ATS analysis, or recruiter questions? Reach out to our campus team below.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Info & FAQs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Info Cards */}
            <div className="bg-[#FFFFFF] border-2 border-[#0FA34E]/20 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-[#0B7C3C] font-display flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0FA34E]" />
                Direct Channels
              </h2>

              <div className="space-y-3 pt-1">
                <a
                  href="mailto:kampusace@gmail.com"
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#DFF5E6]/40 hover:bg-[#DFF5E6] border border-[#0FA34E]/15 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0FA34E] text-[#D7F27A] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#0B7C3C]/70">Official Email</div>
                    <div className="text-sm font-black text-[#0B7C3C] group-hover:underline">kampusace@gmail.com</div>
                    <div className="text-[11px] text-[#0FA34E] font-medium mt-0.5">Replies within 2-4 hours</div>
                  </div>
                </a>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#DFF5E6]/40 border border-[#0FA34E]/15">
                  <div className="w-10 h-10 rounded-xl bg-[#0FA34E] text-[#D7F27A] flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#0B7C3C]/70">Location Hub</div>
                    <div className="text-sm font-bold text-[#0B7C3C]">KIIT University Campus</div>
                    <div className="text-[11px] text-[#0B7C3C]/70">Bhubaneswar, Odisha, India</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#DFF5E6]/40 border border-[#0FA34E]/15">
                  <div className="w-10 h-10 rounded-xl bg-[#0FA34E] text-[#D7F27A] flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#0B7C3C]/70">Support Hours</div>
                    <div className="text-sm font-bold text-[#0B7C3C]">Active 24/7</div>
                    <div className="text-[11px] text-[#0FA34E] font-medium">Throughout Placement Season 2026-27</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick FAQs */}
            <div className="bg-[#FFFFFF] border-2 border-[#0FA34E]/20 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-[#0B7C3C] font-display flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#0FA34E]" />
                Frequently Asked
              </h2>

              <div className="space-y-2.5">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-[#0FA34E]/15 rounded-2xl overflow-hidden bg-[#F8FAFC] transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                        className="w-full p-3.5 text-left flex items-center justify-between gap-2 text-xs font-bold text-[#0B7C3C] hover:text-[#0FA34E]"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#0FA34E]' : 'text-[#0B7C3C]/60'}`} />
                      </button>
                      {isOpen && (
                        <div className="px-3.5 pb-3.5 text-xs text-[#475569] leading-relaxed border-t border-[#0FA34E]/10 pt-2 bg-white font-normal">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFFFFF] border-2 border-[#0FA34E]/25 rounded-3xl p-6 sm:p-8 shadow-md"
            >
              <div className="mb-6 space-y-1">
                <h2 className="text-2xl font-black text-[#0FA34E] font-display">
                  Send us a Message ✍️
                </h2>
                <p className="text-xs text-[#0B7C3C] font-medium">
                  Fill out the form below and an administrator will review your message immediately.
                </p>
              </div>

              {status.type && (
                <div
                  className={`p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs sm:text-sm font-bold ${
                    status.type === 'success'
                      ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                      : 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]'
                  }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  )}
                  <p className="leading-snug">{status.msg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Your Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Mishra"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Your Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@kiit.ac.in"
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Inquiry Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={inputStyle}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Subject / Topic</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Question regarding Microsoft OA"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Detailed Message / Problem Description *</label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your question, request, or issue with as much detail as possible..."
                    style={inputStyle}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-full font-bold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  style={{ background: '#0FA34E', color: '#F6E9D2', fontFamily: '"Baloo 2", cursive' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Transmitting Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#C6FF3D]" />
                      <span>Send Message to Kampus Ace Team</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
