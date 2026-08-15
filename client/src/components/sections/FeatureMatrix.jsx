import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Building2,
  FileCheck,
  Target,
  Sliders,
  Users,
  FileText,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Award,
  Sparkles,
  ChevronRight,
  Code2,
  Lock,
  Pause,
  Play
} from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { useScrollReveal, fadeUpVariants } from '@/hooks/useScrollReveal';

const STATIONS = [
  {
    id: 'company_bank',
    title: 'Recruiter Intelligence Bank',
    badge: '40+ KIIT Recruiters',
    icon: Building2,
    color: '#0FA34E',
    tagline: 'Actual round-by-round transcripts from KIIT 2024 & 2025 placed alumni',
    description:
      'Stop studying blind. Access exact coding question archives, SQL schemas, aptitude patterns, and interview round breakdowns for HighRadius, Deloitte USI, Microsoft, PwC, Zscaler, and Amazon.',
    stats: [
      { label: 'Verified Questions', value: '1,450+' },
      { label: 'Campus Drives', value: '40+' },
      { label: 'Avg Offer CTC', value: '₹14.2 LPA' }
    ],
    features: [
      'Round-by-round interview breakdown (OA, Technical 1, Technical 2, HR)',
      'Real SQL schemas tested in HighRadius & Oracle online assessments',
      'Recent KIIT alumni advice & key mistakes to avoid'
    ],
    ctaText: 'Explore Recruiter Bank',
    ctaLink: '/company-bank',
    previewBadge: 'HighRadius & Microsoft 2025 OA Verified'
  },
  {
    id: 'mock_assessments',
    title: 'Proctored Mock Test Engine',
    badge: 'Anti-Cheat Proctored',
    icon: Target,
    color: '#E8A33D',
    tagline: 'Timed full-screen assessments with proctored anti-cheat detection',
    description:
      'Simulate high-stakes campus aptitude & technical rounds. If you leave full screen twice, the test auto-terminates with detailed performance diagnostics and targeted study recommendations.',
    stats: [
      { label: 'Topic Banks', value: '180+' },
      { label: 'Proctor Violations', value: 'Real-time' },
      { label: 'Scorecard Report', value: 'Instant' }
    ],
    features: [
      'Strict fullscreen anti-cheat lock with dual-strike termination',
      'Dynamic MCQ generator covering DSA, Java, SQL, React, and Python',
      'Personalized study plan pinpointing your critical weak areas'
    ],
    ctaText: 'Launch Mock Test',
    ctaLink: '/assessment',
    previewBadge: 'AI Proctored Simulation Active'
  },
  {
    id: 'ats_checker',
    title: '9-Dimension ATS Scanner',
    badge: 'Placement Verified',
    icon: FileCheck,
    color: '#0FA34E',
    tagline: 'Granular multi-layer resume audit calibrated for campus ATS filters',
    description:
      'Upload your PDF/DOCX resume for progressive parsing across 9 dimensions — formatting, keyword density, action verb strength, contact info, completeness, and recruiter readability.',
    stats: [
      { label: 'Score Dimensions', value: '9 Layers' },
      { label: 'Parsing Time', value: '< 2.8s' },
      { label: 'Accuracy', value: '99.4%' }
    ],
    features: [
      'Progressive live upload indicator with detailed phase metrics',
      'Action item flags categorised by High, Medium, and Low severity',
      'Keyword density gauge with missing essential terminology'
    ],
    ctaText: 'Scan My Resume Free',
    ctaLink: '/dashboard',
    previewBadge: 'Live Multi-Layer Evaluation'
  },
  {
    id: 'jd_matcher',
    title: 'Semantic JD Matcher',
    badge: 'AI Fit Analysis',
    icon: Sliders,
    color: '#0B7C3C',
    tagline: 'Compare your resume against specific company JD requirements',
    description:
      'Paste any job description or upload a recruiter requirements PDF to receive a precise match percentage, skill gap breakdown, and instant AI-bullet rewrite suggestions.',
    stats: [
      { label: 'Semantic Matching', value: 'Embeddings' },
      { label: 'Gap Analysis', value: 'Skill by Skill' },
      { label: 'Bullet Rewrites', value: 'AI Generated' }
    ],
    features: [
      'Dual-input pane with live side-by-side JD vs Resume comparison',
      'Instant skill injection advice to maximize recruiter shortlisting',
      'Subscores across Education, Experience, Skills & Terminology'
    ],
    ctaText: 'Match Resume with JD',
    ctaLink: '/jd-matcher',
    previewBadge: 'Semantic Match Engine'
  },
  {
    id: 'doubt_sessions',
    title: 'Live Alumni Doubt Clinics',
    badge: '1-on-1 & Pooled',
    icon: Users,
    color: '#E8A33D',
    tagline: 'Book live mentor slots with placed KIIT seniors via Google Meet',
    description:
      'Have doubts regarding coding rounds or HR interview grills? Book a pooled slot with alumni currently working at Microsoft, HighRadius, Deloitte, and Zscaler. Meet links emailed upon booking.',
    stats: [
      { label: 'Active Mentors', value: '25+ Alums' },
      { label: 'Confirmed Slots', value: 'Instant Email' },
      { label: 'Seat Tracking', value: 'Real-time' }
    ],
    features: [
      'Real-time seat vacancy indicators and one-click slot booking',
      'Automated confirmation email dispatch with Google Meet links',
      'Direct interaction with seniors who cleared the exact campus drive'
    ],
    ctaText: 'Book Doubt Slot',
    ctaLink: '/doubt-sessions',
    previewBadge: 'Google Meet Confirmation Active'
  },
  {
    id: 'resume_builder',
    title: 'Single-Page ATS Resume Builder',
    badge: '4 Curated Templates',
    icon: FileText,
    color: '#0FA34E',
    tagline: 'Instant A4 campus placement templates with 1-click PDF export',
    description:
      'Generate a recruiter-ready single-page resume formatted to campus recruiter guidelines. Switch between KIIT Standard, Minimal Tech, Executive Modern, and Compact Developer layouts.',
    stats: [
      { label: 'Templates', value: '4 Layouts' },
      { label: 'Format', value: '1-Page ATS' },
      { label: 'Export', value: 'Print / PDF' }
    ],
    features: [
      'Pre-populated with your verified Google account profile information',
      'Real-time live A4 canvas preview with pixel-accurate layout',
      '100% free browser-native high resolution PDF generation'
    ],
    ctaText: 'Build Placement Resume',
    ctaLink: '/resume-builder',
    previewBadge: 'Print-Ready PDF Engine'
  }
];

const ROTATION_INTERVAL_MS = 3000;

export default function FeatureMatrix() {
  const { ref, controls } = useScrollReveal(0.1);
  const [activeTab, setActiveTab] = useState(STATIONS[0].id);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-change timer
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = STATIONS.findIndex((s) => s.id === current);
        const nextIndex = (currentIndex + 1) % STATIONS.length;
        return STATIONS[nextIndex].id;
      });
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isPaused]);

  const activeStation = STATIONS.find((s) => s.id === activeTab) || STATIONS[0];
  const IconComponent = activeStation.icon;

  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: '#D7F27A' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative Konark Wheel Watermark */}
      <div className="absolute -top-12 -right-12 w-80 h-80 opacity-[0.07] pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="#0FA34E" strokeWidth="6" strokeDasharray="12 6" />
          <circle cx="100" cy="100" r="80" stroke="#0FA34E" strokeWidth="4" />
          <circle cx="100" cy="100" r="28" stroke="#0FA34E" strokeWidth="5" />
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1="100"
              y1="30"
              x2="100"
              y2="70"
              stroke="#0FA34E"
              strokeWidth={i % 3 === 0 ? "4" : "2"}
              transform={`rotate(${(i * 360) / 24} 100 100)`}
            />
          ))}
        </svg>
      </div>

      <div className="section-container relative z-10 space-y-12">
        
        {/* Section Header */}
        <motion.div
          ref={ref}
          variants={fadeUpVariants}
          initial="hidden"
          animate={controls}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-xs font-bold border shadow-sm"
            style={{ background: '#F6E9D2', color: '#0FA34E', borderColor: 'rgba(15, 163, 78, 0.3)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>KIIT PLACEMENT ECOSYSTEM</span>
          </div>

          <h2 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-[#0FA34E]">
            Placement Battle Stations
          </h2>

          <p className="text-sm sm:text-base font-medium text-[#0B7C3C] max-w-2xl mx-auto leading-relaxed">
            Six dedicated modules engineered specifically to guide KIIT University students through every hurdle of campus placement season.
          </p>
        </motion.div>

        {/* Interactive Tab Selectors */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {STATIONS.map((station) => {
            const Icon = station.icon;
            const isActive = activeTab === station.id;
            return (
              <motion.button
                key={station.id}
                onClick={() => {
                  setActiveTab(station.id);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full font-display font-extrabold text-xs sm:text-sm transition-all shadow-sm border ${
                  isActive
                    ? 'bg-[#0FA34E] text-[#F6E9D2] shadow-md border-[#0FA34E]'
                    : 'bg-[#F6E9D2] text-[#0FA34E] hover:bg-[#F6E9D2]/90 border-[#0FA34E]/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{station.title}</span>
              </motion.button>
            );
          })}
        </div>


        {/* Active Station Display Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6 sm:p-10 rounded-3xl border-2 shadow-xl relative overflow-hidden"
            style={{ background: '#F6E9D2', borderColor: 'rgba(15, 163, 78, 0.25)' }}
          >
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0FA34E] via-[#C6FF3D] to-[#0FA34E]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Station Info & Features */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[#0FA34E] text-[#C6FF3D]">
                      {activeStation.badge}
                    </span>
                    <span className="font-mono text-xs font-medium text-[#0B7C3C88]">
                      {activeStation.previewBadge}
                    </span>
                  </div>

                  <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0FA34E] leading-tight">
                    {activeStation.title}
                  </h3>

                  <p className="font-cursive text-xl sm:text-2xl font-bold text-[#0B7C3C]">
                    "{activeStation.tagline}"
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#0B7C3C] leading-relaxed font-sans font-medium">
                  {activeStation.description}
                </p>

                {/* Key Features Bullet List */}
                <div className="space-y-2.5 pt-2">
                  {activeStation.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#0B7C3C]">
                      <div className="w-5 h-5 rounded-full bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <Link
                    to={activeStation.ctaLink}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-display font-extrabold text-sm sm:text-base shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl"
                    style={{
                      background: '#0FA34E',
                      color: '#F6E9D2',
                      border: '2px solid rgba(198, 255, 61, 0.4)'
                    }}
                  >
                    <span>{activeStation.ctaText}</span>
                    <ArrowRight className="w-5 h-5 text-[#C6FF3D]" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Live Metric Dashboard Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 rounded-3xl border-2 space-y-6 shadow-md"
                  style={{ background: '#DFF5E6', borderColor: 'rgba(15, 163, 78, 0.25)' }}>
                  
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'rgba(15, 163, 78, 0.15)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#0FA34E] text-[#D7F27A] flex items-center justify-center shadow">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-display font-extrabold text-sm text-[#0FA34E]">
                        Live Metrics
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0FA34E] bg-[#D7F27A] px-2.5 py-0.5 rounded-full border border-[#0FA34E]/20">
                      ⚡ Active
                    </span>
                  </div>

                  {/* 3 Metric counters */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {activeStation.stats.map((stat, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-[#F6E9D2] border border-[#0FA34E]/20 shadow-sm">
                        <div className="font-display font-black text-lg sm:text-xl text-[#0FA34E]">
                          {stat.value}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-[#0B7C3C88] mt-0.5">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Banner */}
                  <div className="p-3.5 rounded-2xl bg-[#0FA34E] text-[#F6E9D2] text-xs font-mono font-bold flex items-center gap-2.5 shadow">
                    <ShieldCheck className="w-5 h-5 text-[#C6FF3D] shrink-0" />
                    <span className="truncate">Verified against 2024-25 KIIT Placement Drive norms</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
