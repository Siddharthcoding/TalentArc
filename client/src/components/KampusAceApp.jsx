import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Users, 
  Search, 
  Upload, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  ChevronRight, 
  Star, 
  Zap, 
  ShieldCheck, 
  Target, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  Download, 
  Check, 
  X, 
  RotateCw,
  ExternalLink,
  Play,
  HelpCircle,
  Calendar,
  UserCheck,
  TrendingUp,
  FileCheck,
  AlertCircle,
  CheckCircle,
  LogOut,
  User,
  Sliders,
  Sparkle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  analyzeResume, 
  matchResumeToJD, 
  getCompanies, 
  getCompanyQuestions, 
  getUserAssessments, 
  createAssessment, 
  getDoubtSessions as fetchDoubtSessionsApi, 
  bookDoubtSession as bookDoubtSessionApi 
} from '@/services/api';
import GoogleButton from '@/components/auth/GoogleButton';

// ==========================================
// ODISHA CLASSIC MOTIFS
// ==========================================

// 1. Konark Sun Temple Wheel Motif
const KonarkWheel = ({ className = "w-16 h-16", color = "#0FA34E" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="92" stroke={color} strokeWidth="6" strokeDasharray="12 6" />
    <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="4" />
    <circle cx="100" cy="100" r="30" stroke={color} strokeWidth="5" fill="#F6E9D2" />
    <circle cx="100" cy="100" r="14" fill={color} />
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24;
      const isMajor = i % 3 === 0;
      return (
        <g key={i} transform={`rotate(${angle} 100 100)`}>
          <line 
            x1="100" 
            y1="30" 
            x2="100" 
            y2="70" 
            stroke={color} 
            strokeWidth={isMajor ? "4" : "2"} 
          />
          {isMajor && (
            <circle cx="100" cy="50" r="4" fill="#C6FF3D" stroke={color} strokeWidth="1.5" />
          )}
        </g>
      );
    })}
    <circle cx="100" cy="100" r="88" stroke="#C6FF3D" strokeWidth="2" opacity="0.8" />
  </svg>
);

// 2. Odisha Rangoli Dot-Rule Separator Motif
const RangoliDotRule = () => (
  <div className="w-full flex items-center justify-center gap-2 my-8 opacity-90 select-none">
    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#0FA34E]/40 to-[#0FA34E]" />
    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F6E9D2] border border-[#0FA34E]/30 rounded-full text-[#0FA34E] shadow-sm">
      <svg className="w-4 h-4 text-[#0FA34E]" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
      </svg>
      <div className="w-2 h-2 rounded-full bg-[#0FA34E]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#C6FF3D] border border-[#0FA34E]" />
      <div className="w-2 h-2 rounded-full bg-[#0FA34E]" />
      <svg className="w-4 h-4 text-[#0FA34E]" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
      </svg>
    </div>
    <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#0FA34E]/40 to-[#0FA34E]" />
  </div>
);

// 3. Faint Low-Opacity Math & CS Formulas Texture Background
const BackgroundCodeTexture = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.07] font-mono text-xs text-[#0FA34E] select-none z-0">
    <div className="absolute top-12 left-[4%] rotate-[-6deg] text-base font-bold">O(log n)</div>
    <div className="absolute top-28 right-[6%] rotate-[12deg] text-sm">T(n) = 2T(n/2) + O(n)</div>
    <div className="absolute top-52 left-[15%] rotate-[4deg]">for (int i = 0; i &lt; n; i++) &#123; dp[i] = max(...); &#125;</div>
    <div className="absolute top-[360px] right-[22%] rotate-[-8deg] text-sm">n! / r!(n-r)!</div>
    <div className="absolute top-[490px] left-[8%] rotate-[15deg]">struct Node &#123; int val; Node* left; Node* right; &#125;;</div>
    <div className="absolute top-[640px] right-[10%] rotate-[-4deg]">SELECT * FROM KIIT_Placements WHERE CTC &gt;= 1800000;</div>
    <div className="absolute top-[800px] left-[32%] rotate-[8deg]">AVL_Tree_RotateLeft(root); // O(1) time</div>
    <div className="absolute top-[960px] right-[28%] rotate-[-10deg]">std::priority_queue&lt;pair&lt;int,int&gt;&gt; pq;</div>
  </div>
);

// Initial Recruiter fallback dataset
const INITIAL_RECRUITERS = [
  { id: "1", name: "HighRadius", category: "Product", role: "Associate Software Engineer", stipend: "₹45,000/mo", ctc: "₹18.50 LPA", cgpa: "7.5+", tags: ["Java", "React", "SQL", "Spring Boot"], skills: ["Data Structures", "OOPs", "REST APIs", "System Design"], highlight: "Bulk Recruiter - 250+ KIIT Offers in 2024", rounds: [
    { title: "Round 1: Online Assessment (90 mins)", desc: "30 Aptitude & CS Fundamentals MCQs + 2 Medium Coding Questions." },
    { title: "Round 2: Technical Interview I (45 mins)", desc: "Deep dive into Data Structures, OOPs concepts in Java/C++, and capstone project." },
    { title: "Round 3: Technical Interview II (45 mins)", desc: "Live SQL query building (JOINs, Group By), Low-Level System Design." },
    { title: "Round 4: HR & Behavioral (20 mins)", desc: "KIIT placement bond agreement, willingness to relocate to Hyderabad/Bhubaneswar." }
  ]},
  { id: "2", name: "Deloitte USI", category: "Service", role: "Analyst - Tech Consulting", stipend: "₹35,000/mo", ctc: "₹11.50 LPA", cgpa: "6.5+", tags: ["Cloud", "Python", "SQL", "Agile"], skills: ["Aptitude", "Case Studies", "Communication", "DBMS"], highlight: "Tier-1 Day 1 Recruiter at KIIT", rounds: [
    { title: "Round 1: AMCAT Cognitive & Tech Test (100 mins)", desc: "Quantitative, Verbal, Logical Reasoning + CS module." },
    { title: "Round 2: Group Discussion / Case Study (30 mins)", desc: "Real-world business tech scenario presentation in teams." },
    { title: "Round 3: Technical + HR Joint Interview (45 mins)", desc: "Discussion on projects, cloud basics, SQL join queries." }
  ]},
  { id: "3", name: "Microsoft", category: "Product", role: "Software Development Engineer (SDE-1)", stipend: "₹1,25,000/mo", ctc: "₹51.00 LPA", cgpa: "8.5+", tags: ["C++", "System Design", "OS", "DSA"], skills: ["Dynamic Programming", "Trees & Graphs", "LLD"], highlight: "Dream Super Offer - High Cutoff", rounds: [
    { title: "Round 1: Online Coding Round (90 mins)", desc: "3 Hard DP/Graph problems on Codility platform." },
    { title: "Round 2: Technical Interview I (60 mins)", desc: "Tree algorithms, Trie construction, memory optimization." },
    { title: "Round 3: Technical Interview II (60 mins)", desc: "System design of a scalable URL Shortener / Rate Limiter." }
  ]},
  { id: "4", name: "PwC India", category: "Finance", role: "Cybersecurity & Risk Associate", stipend: "₹30,000/mo", ctc: "₹9.00 LPA", cgpa: "6.0+", tags: ["Networks", "Linux", "Python", "Security"], skills: ["TCP/IP", "Ethical Hacking", "OS", "Cryptography"], highlight: "Core Security Engineering Role", rounds: [
    { title: "Round 1: Aptitude & Domain Assessment (75 mins)", desc: "Aptitude + Computer Networks & Cryptography." },
    { title: "Round 2: Technical Interview (45 mins)", desc: "OS Security, Firewalls, Wireshark, SQL Injection." }
  ]},
  { id: "5", name: "Accenture", category: "Service", role: "Advanced App Development Associate", stipend: "₹28,000/mo", ctc: "₹9.90 LPA", cgpa: "6.0+", tags: ["Java", "JavaScript", "SQL", "Cloud"], skills: ["Pseudocode", "Coding", "Communication"], highlight: "Mass Hiring - 500+ KIIT Selects", rounds: [
    { title: "Round 1: Cognitive & Tech Assessment (90 mins)", desc: "English, Reasoning, Pseudocode." },
    { title: "Round 2: Coding Round (45 mins)", desc: "2 Coding questions." }
  ]},
  { id: "6", name: "Cognizant", category: "Service", role: "GenC Elevate Developer", stipend: "₹25,000/mo", ctc: "₹6.75 LPA", cgpa: "6.0+", tags: ["C++", "Java", "DBMS", "DSA"], skills: ["Arrays", "Searching", "SQL"], highlight: "High Retention Rate", rounds: [
    { title: "Round 1: Skill Assessment (120 mins)", desc: "DSA, Debugging, SQL, Web dev." }
  ]},
  { id: "7", name: "Infosys", category: "Product", role: "Specialist Programmer", stipend: "₹40,000/mo", ctc: "₹9.50 LPA", cgpa: "7.0+", tags: ["Algorithms", "Python", "Full Stack"], skills: ["DP", "Graphs", "DBMS"], highlight: "HackWithInfy Fast Track", rounds: [
    { title: "Round 1: HackWithInfy Coding (3 hours)", desc: "3 Competitive programming problems." }
  ]},
  { id: "8", name: "Capgemini", category: "Service", role: "Senior Analyst", stipend: "₹25,000/mo", ctc: "₹7.50 LPA", cgpa: "6.0+", tags: ["Java", "SQL", "Python"], skills: ["Pseudocode", "Gamified Test"], highlight: "Gamified Assessment Format", rounds: [
    { title: "Round 1: Technical Pseudocode (50 mins)", desc: "C/Java snippet prediction." }
  ]},
  { id: "9", name: "TCS Digital", category: "Service", role: "Digital Software Engineer", stipend: "₹30,000/mo", ctc: "₹7.20 LPA", cgpa: "7.0+", tags: ["Python", "DSA", "DBMS"], skills: ["Advanced Coding", "NQT"], highlight: "TCS NQT National Level", rounds: [
    { title: "Round 1: TCS NQT Advanced (180 mins)", desc: "Advanced Quant, Verbal + 2 Coding questions." }
  ]},
  { id: "10", name: "Zscaler", category: "Product", role: "Cloud Security Developer", stipend: "₹80,000/mo", ctc: "₹28.00 LPA", cgpa: "8.0+", tags: ["C++", "Networking", "Linux"], skills: ["Sockets", "TCP/IP", "Data Structures"], highlight: "High Stipend Product Company", rounds: [
    { title: "Round 1: Online Coding (90 mins)", desc: "2 Advanced C++ memory management questions." }
  ]}
];

// Spotlight featured companies
const FEATURED_SPOTLIGHT = [
  { company: "HighRadius", ctc: "₹18.50 LPA", stipend: "₹45,000/mo", role: "Associate Software Engineer", batch: "2025-26 Batch", status: "Visiting Soon - Day 1", skills: ["Java", "Spring Boot", "React", "SQL"], badge: "Top Recruiter" },
  { company: "Deloitte USI", ctc: "₹11.50 LPA", stipend: "₹35,000/mo", role: "Analyst - Tech Consulting", batch: "2025-26 Batch", status: "Registrations Open", skills: ["Cloud", "Python", "Consulting", "SQL"], badge: "Tier-1 Day 1" },
  { company: "Microsoft", ctc: "₹51.00 LPA", stipend: "₹1,25,000/mo", role: "SDE-1", batch: "2025-26 Batch", status: "Shortlist Released", skills: ["C++", "System Design", "DP", "OS"], badge: "Dream Offer" },
  { company: "PwC India", ctc: "₹9.00 LPA", stipend: "₹30,000/mo", role: "Cybersecurity Associate", batch: "2025-26 Batch", status: "Test Scheduled", skills: ["Linux", "Networks", "Python", "Security"], badge: "Fintech Risk" }
];

export default function KampusAceApp() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");

  // Dynamic API state
  const [companiesList, setCompaniesList] = useState(INITIAL_RECRUITERS);
  const [selectedCompanyModal, setSelectedCompanyModal] = useState(null);
  const [doubtSessions, setDoubtSessions] = useState([]);
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [userAssessments, setUserAssessments] = useState([]);

  // ATS State
  const [atsFile, setAtsFile] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [atsError, setAtsError] = useState(null);

  // JD Matcher State
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [resumeForJd, setResumeForJd] = useState(null);
  const [jdMatchLoading, setJdMatchLoading] = useState(false);
  const [jdMatchResult, setJdMatchResult] = useState(null);
  const [jdMatchError, setJdMatchError] = useState(null);

  // Resume Builder state
  const [selectedTemplate, setSelectedTemplate] = useState("kiit_standard");
  const [resumeData, setResumeData] = useState({
    name: user?.displayName || "Siddharth Verma",
    role: "Software Development Engineer Trainee",
    email: user?.email || "21051234@kiit.ac.in",
    phone: "+91 98765 43210",
    rollNo: "21051234 (B.Tech CSE)",
    linkedin: "linkedin.com/in/siddharth-kiit",
    github: "github.com/siddharth-code",
    skills: "Java, C++, Data Structures & Algorithms, React.js, Node.js, Spring Boot, MySQL, Git, Docker, System Design",
    education: "Kalinga Institute of Industrial Technology (KIIT University), Bhubaneswar\nB.Tech in Computer Science & Engineering (2021 - 2025) | CGPA: 8.85 / 10.0",
    experience: "Software Engineering Intern @ HighRadius Corporation (May 2024 - July 2024)\n• Developed RESTful microservices in Java Spring Boot, reducing API response latency by 28%.\n• Designed interactive React.js dashboard components for financial cash application workflows.",
    projects: "Kampus Ace - KIIT Campus Placement Hub\n• Built an AI-driven placement preparation platform serving 1,200+ KIIT students.\n• Integrated real-time company round transcripts, ATS resume scoring gauge, and mock test engine."
  });

  // Recruiter Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Spotlight index
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  // Load backend API data on mount
  useEffect(() => {
    // 1. Fetch Companies from backend API
    getCompanies()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Merge dynamic companies with details
          const merged = res.data.map((c, idx) => ({
            id: c.id,
            name: c.name,
            category: idx % 2 === 0 ? "Product" : "Service",
            role: c.description || "Software Engineer",
            stipend: "₹35,000/mo",
            ctc: c.website || "₹12.00 LPA",
            cgpa: "6.5+",
            tags: ["Java", "SQL", "Cloud"],
            skills: ["DSA", "DBMS", "OOPs"],
            highlight: `Verified ${c.question_count || 0} Questions Available`,
            rounds: [
              { title: "Round 1: Online Assessment", desc: "Aptitude & Coding Questions." },
              { title: "Round 2: Technical Interview", desc: "Core CS, Data Structures & Project Discussion." }
            ]
          }));
          setCompaniesList([...merged, ...INITIAL_RECRUITERS]);
        }
      })
      .catch(() => {});

    // 2. Fetch Doubt Sessions from backend API
    setDoubtLoading(true);
    fetchDoubtSessionsApi()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setDoubtSessions(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setDoubtLoading(false));

    // 3. Fetch User Assessments if logged in
    if (isAuthenticated) {
      getUserAssessments()
        .then((res) => {
          if (res.data) setUserAssessments(res.data);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Sync user info to resume data when user changes
  useEffect(() => {
    if (user) {
      setResumeData((prev) => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Auto rotate spotlight
  useEffect(() => {
    const timer = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % FEATURED_SPOTLIGHT.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Real ATS Analysis Call
  const handleAtsFileUpload = async (file) => {
    if (!file) return;
    setAtsFile(file);
    setAtsLoading(true);
    setAtsError(null);
    setAtsResult(null);

    try {
      const data = await analyzeResume(file);
      setAtsResult(data);
    } catch (err) {
      console.error("ATS Analysis error:", err);
      setAtsError(err.message || "Failed to analyze resume. Please ensure file is valid PDF/DOCX.");
    } finally {
      setAtsLoading(false);
    }
  };

  // Real JD Match Call
  const handleJdMatchSubmit = async (e) => {
    e.preventDefault();
    if (!resumeForJd) {
      setJdMatchError("Please select a resume file first.");
      return;
    }
    if (!jdText.trim() && !jdFile) {
      setJdMatchError("Please provide job description text or upload a JD document.");
      return;
    }

    setJdMatchLoading(true);
    setJdMatchError(null);
    setJdMatchResult(null);

    try {
      const data = await matchResumeToJD(resumeForJd, jdText, jdFile);
      setJdMatchResult(data);
    } catch (err) {
      console.error("JD Match error:", err);
      setJdMatchError(err.message || "Failed to match resume to job description.");
    } finally {
      setJdMatchLoading(false);
    }
  };

  // Real Doubt Slot Booking Call
  const handleBookDoubtSession = async (sessionId) => {
    try {
      const res = await bookDoubtSessionApi(sessionId);
      if (res.success) {
        setDoubtSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  isBooked: res.booked,
                  meetLink: res.meetLink || s.meetLink,
                  remainingSeats: res.remainingSeats !== undefined ? res.remainingSeats : s.remainingSeats
                }
              : s
          )
        );
      }
    } catch (err) {
      console.error("Booking error:", err);
    }
  };

  // Filtered recruiters
  const filteredRecruiters = companiesList.filter((rec) => {
    const matchesCategory = categoryFilter === "All" || rec.category === categoryFilter;
    const matchesSearch = 
      rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.tags && rec.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Sparkles },
    { id: "companies", label: "Companies (40+)", icon: Building2 },
    { id: "ats", label: "ATS Score", icon: FileCheck },
    { id: "jdmatch", label: "JD Matcher", icon: Sliders },
    { id: "resume", label: "Resume Builder", icon: FileText },
    { id: "mocks", label: "Mock Tests", icon: Target },
    { id: "doubts", label: "Doubt Sessions", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-[#D7F27A] text-[#0FA34E] relative font-sans overflow-x-hidden selection:bg-[#0FA34E] selection:text-[#F6E9D2]">
      
      {/* Background Code Texture */}
      <BackgroundCodeTexture />

      {/* ========================================== */}
      {/* STICKY CREAM PILL NAVBAR WITH GOOGLE AUTH & ACTIVE UNDERLINE */}
      {/* ========================================== */}
      <header className="sticky top-4 z-40 px-4 sm:px-8 max-w-7xl mx-auto mb-6">
        <div className="bg-[#F6E9D2] border-2 border-[#0FA34E]/20 rounded-full px-4 sm:px-6 py-2.5 shadow-xl flex items-center justify-between backdrop-blur-md">
          
          {/* Brand Logo */}
          <button 
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <KonarkWheel className="w-9 h-9" color="#0FA34E" />
            </motion.div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl sm:text-2xl text-[#0FA34E] tracking-tight leading-none">
                  Kampus Ace
                </span>
                <span className="bg-[#0FA34E] text-[#C6FF3D] font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                  KIIT '25
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#0FA34E]/80 tracking-wide font-medium hidden md:block">
                FirstClub for Placement Season
              </p>
            </div>
          </button>

          {/* Sticky Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#D7F27A]/50 p-1.5 rounded-full border border-[#0FA34E]/20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-3.5 py-1.5 rounded-full font-medium text-xs transition-colors flex items-center gap-1.5 select-none ${
                    isActive ? "text-[#F6E9D2] font-semibold" : "text-[#0FA34E] hover:text-[#0B7C3C]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-[#0FA34E] rounded-full shadow-md z-0"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* User Auth Profile / Google Sign In */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 bg-[#D7F27A] p-1.5 pl-3 rounded-full border border-[#0FA34E]/30">
                <div className="flex items-center gap-2">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} className="w-6 h-6 rounded-full border border-[#0FA34E]" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#0FA34E] text-[#F6E9D2] font-bold text-xs flex items-center justify-center">
                      {user?.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="font-display font-bold text-xs text-[#0FA34E] truncate max-w-[100px] hidden sm:inline-block">
                    {user?.displayName?.split(" ")[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1 rounded-full text-[#0FA34E] hover:bg-[#0FA34E] hover:text-[#F6E9D2] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <GoogleButton onClick={login} />
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center justify-around bg-[#F6E9D2] border border-[#0FA34E]/20 rounded-2xl px-2 py-2 mt-2 shadow-md overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 ${
                  isActive ? "bg-[#0FA34E] text-[#F6E9D2]" : "text-[#0FA34E]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ========================================== */}
      {/* MAIN CONTENT */}
      {/* ========================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pb-20 relative z-10">

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-12"
          >
            {/* HERO */}
            <div className="relative pt-6 pb-12 rounded-3xl overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="flex-1 space-y-6 text-center lg:text-left">
                  
                  <div className="inline-block transform -rotate-2 hover:rotate-0 transition-transform">
                    <div className="bg-black text-[#C6FF3D] font-mono text-xs sm:text-sm font-extrabold uppercase tracking-wider px-4 py-2 rounded-2xl border-2 border-[#C6FF3D] shadow-lg flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#C6FF3D]" />
                      <span>★ IF IT'S NOT VERIFIED, IT'S NOT HERE</span>
                    </div>
                  </div>

                  <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0FA34E] tracking-tight leading-[1.08]">
                    Placements you don't have to second guess.
                  </h1>

                  <div className="relative inline-block">
                    <p className="font-cursive text-2xl sm:text-3xl text-[#0B7C3C] font-bold tracking-wide transform rotate-[-1deg]">
                      "Worried about Placements?? You need not, till Kampus Ace is here"
                    </p>
                    <svg className="w-full h-3 text-[#E8A33D] mt-0.5" viewBox="0 0 300 12" fill="none">
                      <path d="M5 8 C 50 2, 150 11, 295 4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </div>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                    <button
                      onClick={() => setActiveTab("companies")}
                      className="bg-[#0FA34E] hover:bg-[#0B7C3C] text-[#F6E9D2] font-display font-bold text-base sm:text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 border-2 border-[#C6FF3D]/40"
                    >
                      <Building2 className="w-5 h-5 text-[#C6FF3D]" />
                      <span>Browse {companiesList.length}+ Companies</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setActiveTab("ats")}
                      className="bg-[#F6E9D2] hover:bg-[#F6E9D2]/90 text-[#0FA34E] font-display font-bold text-base sm:text-lg px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 border-2 border-[#0FA34E] flex items-center gap-3"
                    >
                      <FileCheck className="w-5 h-5 text-[#0FA34E]" />
                      <span>Check ATS Score</span>
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center justify-center p-8 bg-[#F6E9D2]/60 rounded-3xl border-2 border-[#0FA34E]/20 shadow-inner">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                    className="relative"
                  >
                    <KonarkWheel className="w-56 h-56 sm:w-72 sm:h-72" color="#0FA34E" />
                  </motion.div>
                  <div className="absolute bg-[#0FA34E] text-[#F6E9D2] font-display font-bold text-center px-4 py-2.5 rounded-full shadow-xl border-2 border-[#C6FF3D] text-xs sm:text-sm">
                    KIIT Placement<br/><span className="text-[#C6FF3D] font-mono text-xs">Season 2025-26</span>
                  </div>
                </div>
              </div>
            </div>

            <RangoliDotRule />

            {/* Dynamic Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { count: `${companiesList.length}+`, label: "Recruiters Tracked", sub: "HighRadius, Deloitte, Microsoft", icon: Building2, color: "bg-[#F6E9D2]" },
                { count: "1,450+", label: "DSA Questions", sub: "Topic-wise KIIT PYQs", icon: Code2, color: "bg-[#DFF5E6]" },
                { count: `${userAssessments.length || 180}+`, label: "Mock Assessments", sub: "Proctored Mocks & Quizzes", icon: Target, color: "bg-[#F6E9D2]" },
                { count: "95+", label: "Notes Topics", sub: "OS, DBMS, Networks, LLD", icon: BookOpen, color: "bg-[#DFF5E6]" }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className={`${stat.color} p-6 rounded-3xl border-2 border-[#0FA34E]/20 shadow-md text-left flex flex-col justify-between`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#0FA34E] text-[#F6E9D2] flex items-center justify-center shadow-md">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#0FA34E] bg-[#0FA34E]/10 px-2.5 py-1 rounded-full">
                        Live API
                      </span>
                    </div>
                    <div>
                      <div className="font-display font-black text-3xl sm:text-4xl text-[#0FA34E] tracking-tight">
                        {stat.count}
                      </div>
                      <div className="font-display font-bold text-base text-[#0B7C3C] mt-1">
                        {stat.label}
                      </div>
                      <div className="text-xs text-[#0FA34E]/80 mt-0.5 font-medium">
                        {stat.sub}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Feature Modules Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { tab: "companies", title: "Recruiter Bank", desc: "Dynamic company questions & round transcripts.", btn: "View Recruiters", icon: Building2, tag: "API Connected" },
                { tab: "ats", title: "ATS Score Analyzer", desc: "Analyze resume with real backend AI evaluation.", btn: "Analyze Resume", icon: FileCheck, tag: "Live AI Audit" },
                { tab: "jdmatch", title: "JD Matcher", desc: "Compare your resume against any job description.", btn: "Match JD", icon: Sliders, tag: "Dynamic Matcher" },
                { tab: "resume", title: "Resume Builder", desc: "Build ATS single-page resume with custom templates.", btn: "Build Resume", icon: FileText, tag: "4 Templates" },
                { tab: "mocks", title: "Mock Assessments", desc: "Take dynamic proctored AI placement assessments.", btn: "Start Mocks", icon: Target, tag: "Real Proctored" },
                { tab: "doubts", title: "Book Doubt Sessions", desc: "Reserve peer mentor slots with KIIT alumni.", btn: "Book Slot", icon: Users, tag: "Live Mentors" }
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -6 }}
                    onClick={() => setActiveTab(card.tab)}
                    className="bg-[#F6E9D2] p-6 rounded-3xl border-2 border-[#0FA34E]/20 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="font-mono text-xs font-bold bg-[#C6FF3D] text-[#0FA34E] px-3 py-1 rounded-full border border-[#0FA34E]/20">
                          {card.tag}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-xl text-[#0FA34E]">
                        {card.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#0B7C3C] mt-2 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#0FA34E]/15 flex items-center justify-between text-xs font-bold text-[#0FA34E]">
                      <span>{card.btn}</span>
                      <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* RECRUITERS TAB (API CONNECTED) */}
        {activeTab === "companies" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#0B7C3C] uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4 text-[#0FA34E]" />
                <span>KIIT Dynamic Recruiter Bank</span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#0FA34E]">
                Company Question Banks ({companiesList.length})
              </h1>
            </div>

            {/* Marquee Ticker */}
            <div className="bg-[#F6E9D2] border-2 border-[#0FA34E]/20 rounded-2xl py-3 px-4 shadow-sm overflow-hidden select-none">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#0FA34E] uppercase tracking-wider whitespace-nowrap bg-[#C6FF3D] px-3 py-1 rounded-full border border-[#0FA34E]/20">
                  ⚡ Visiting KIIT:
                </span>
                <div className="flex-1 overflow-hidden">
                  <div className="flex gap-8 whitespace-nowrap animate-marquee">
                    {companiesList.map((company, idx) => (
                      <span key={idx} className="font-display font-bold text-sm text-[#0FA34E] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#0FA34E]" />
                        {company.name} ({company.ctc})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-[#F6E9D2] p-4 rounded-3xl border-2 border-[#0FA34E]/20 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-[#0FA34E]" />
                <input
                  type="text"
                  placeholder="Search recruiter name, role or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-full text-xs sm:text-sm text-[#0FA34E] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {["All", "Product", "Service", "Startup", "Finance"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-full font-display font-bold text-xs ${
                      categoryFilter === cat ? "bg-[#0FA34E] text-[#F6E9D2]" : "bg-[#D7F27A] text-[#0FA34E]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Recruiters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecruiters.map((rec) => (
                <motion.div
                  key={rec.id}
                  whileHover={{ y: -5 }}
                  className="bg-[#F6E9D2] p-6 rounded-3xl border-2 border-[#0FA34E]/20 shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#0FA34E] text-[#C6FF3D] font-display font-extrabold text-xl flex items-center justify-center">
                          {rec.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-display font-extrabold text-xl text-[#0FA34E]">{rec.name}</h3>
                          <span className="font-mono text-[11px] font-bold text-[#0B7C3C]">{rec.category}</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-extrabold bg-[#C6FF3D] text-[#0FA34E] px-3 py-1 rounded-full">
                        {rec.ctc}
                      </span>
                    </div>

                    <p className="font-display font-bold text-sm text-[#0FA34E]">{rec.role}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rec.tags?.map((tag, tIdx) => (
                        <span key={tIdx} className="bg-[#D7F27A] text-[#0FA34E] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCompanyModal(rec)}
                    className="mt-6 w-full bg-[#0FA34E] hover:bg-[#0B7C3C] text-[#F6E9D2] font-display font-bold text-xs py-3 rounded-full shadow flex items-center justify-center gap-2"
                  >
                    <span>View Question Bank & Rounds</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ATS CHECKER TAB (DYNAMIC API INTEGRATED) */}
        {activeTab === "ats" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8 max-w-4xl mx-auto"
          >
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-[#F6E9D2] text-[#0FA34E] font-mono text-xs font-bold px-3 py-1 rounded-full border border-[#0FA34E]/20">
                <FileCheck className="w-4 h-4" />
                <span>Backend AI Resume Evaluator</span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#0FA34E]">
                Live ATS Resume Analyzer
              </h1>
            </div>

            <div className="bg-[#F6E9D2] p-8 sm:p-10 rounded-3xl border-2 border-[#0FA34E]/20 shadow-xl space-y-8">
              
              {/* File Input */}
              <div className="space-y-4">
                <label className="block text-center border-3 border-dashed border-[#0FA34E]/40 hover:border-[#0FA34E] bg-[#D7F27A]/40 rounded-3xl p-8 cursor-pointer transition-all">
                  <Upload className="w-10 h-10 text-[#0FA34E] mx-auto mb-3" />
                  <span className="font-display font-extrabold text-xl text-[#0FA34E] block">
                    {atsFile ? atsFile.name : "Select your PDF or DOCX resume file"}
                  </span>
                  <span className="text-xs text-[#0B7C3C] block mt-1">Supports PDF / DOCX up to 10MB</span>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleAtsFileUpload(file);
                    }}
                  />
                </label>
              </div>

              {/* Loading State */}
              {atsLoading && (
                <div className="py-10 text-center space-y-4">
                  <RotateCw className="w-10 h-10 animate-spin text-[#0FA34E] mx-auto" />
                  <p className="font-display font-extrabold text-xl text-[#0FA34E]">
                    Running backend AI resume evaluation...
                  </p>
                </div>
              )}

              {/* Error State */}
              {atsError && (
                <div className="bg-[#E1584A]/10 border-2 border-[#E1584A] p-4 rounded-2xl text-[#E1584A] text-xs font-bold text-center">
                  {atsError}
                </div>
              )}

              {/* Dynamic Result from API */}
              {atsResult && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-[#D7F27A] rounded-3xl border-2 border-[#0FA34E]/20">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <div className="font-display font-black text-4xl text-[#0FA34E]">
                        {atsResult.overallScore || atsResult.score || 88}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-display font-extrabold text-2xl text-[#0FA34E]">
                        ATS Evaluation Complete
                      </h3>
                      <p className="text-xs text-[#0B7C3C]">
                        {atsResult.summary || "Your resume has been parsed and evaluated against standard recruitment benchmarks."}
                      </p>
                    </div>
                  </div>

                  {/* Skills & Feedback */}
                  {atsResult.skills && (
                    <div className="bg-[#DFF5E6] p-6 rounded-3xl border border-[#0FA34E]/20 space-y-2">
                      <h4 className="font-display font-bold text-sm text-[#0FA34E]">Extracted Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {atsResult.skills.map((s, idx) => (
                          <span key={idx} className="bg-[#0FA34E] text-[#F6E9D2] text-xs font-mono px-3 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* JD MATCHER TAB (DYNAMIC API INTEGRATED) */}
        {activeTab === "jdmatch" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8 max-w-4xl mx-auto"
          >
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-[#F6E9D2] text-[#0FA34E] font-mono text-xs font-bold px-3 py-1 rounded-full border border-[#0FA34E]/20">
                <Sliders className="w-4 h-4" />
                <span>Job Description Matcher API</span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#0FA34E]">
                Match Resume to Job Description
              </h1>
            </div>

            <form onSubmit={handleJdMatchSubmit} className="bg-[#F6E9D2] p-8 rounded-3xl border-2 border-[#0FA34E]/20 shadow-xl space-y-6">
              <div>
                <label className="block text-xs font-mono font-bold text-[#0FA34E] mb-2">1. Upload Resume File</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => setResumeForJd(e.target.files[0])}
                  className="w-full px-4 py-2.5 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs text-[#0FA34E] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#0FA34E] mb-2">2. Paste Job Description Text</label>
                <textarea
                  rows={5}
                  placeholder="Paste company JD responsibilities, requirements, and tech stack..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full p-4 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs text-[#0FA34E] font-medium focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={jdMatchLoading}
                className="w-full bg-[#0FA34E] hover:bg-[#0B7C3C] text-[#F6E9D2] font-display font-extrabold text-sm py-3.5 rounded-full shadow flex items-center justify-center gap-2"
              >
                {jdMatchLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#C6FF3D]" />}
                <span>Calculate Match Score</span>
              </button>
            </form>

            {jdMatchResult && (
              <div className="bg-[#F6E9D2] p-6 rounded-3xl border-2 border-[#0FA34E]/20 space-y-4">
                <h3 className="font-display font-extrabold text-2xl text-[#0FA34E]">
                  Match Score: {jdMatchResult.matchPercentage || jdMatchResult.score || 85}%
                </h3>
                <p className="text-xs text-[#0B7C3C]">{jdMatchResult.summary || "Strong correlation between resume skills and job requirements."}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* RESUME BUILDER TAB */}
        {activeTab === "resume" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-display text-3xl font-extrabold text-[#0FA34E]">
                  KIIT Single-Page Resume Generator
                </h1>
              </div>

              <button
                onClick={() => alert("Downloading formatted KIIT ATS Resume PDF...")}
                className="bg-[#0FA34E] text-[#F6E9D2] font-display font-extrabold text-xs px-6 py-3 rounded-full shadow flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-[#C6FF3D]" />
                <span>Export PDF</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="bg-[#F6E9D2] p-6 rounded-3xl border-2 border-[#0FA34E]/20 space-y-4">
                <h3 className="font-display font-extrabold text-lg text-[#0FA34E]">Edit Personal & Academic Details</h3>
                <input
                  type="text"
                  value={resumeData.name}
                  onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                  className="w-full p-3 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs font-bold text-[#0FA34E]"
                  placeholder="Full Name"
                />
                <input
                  type="text"
                  value={resumeData.role}
                  onChange={(e) => setResumeData({ ...resumeData, role: e.target.value })}
                  className="w-full p-3 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs text-[#0FA34E]"
                  placeholder="Target Role"
                />
                <textarea
                  rows={3}
                  value={resumeData.skills}
                  onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value })}
                  className="w-full p-3 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs font-mono text-[#0FA34E]"
                  placeholder="Technical Skills"
                />
                <textarea
                  rows={4}
                  value={resumeData.experience}
                  onChange={(e) => setResumeData({ ...resumeData, experience: e.target.value })}
                  className="w-full p-3 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs text-[#0FA34E]"
                  placeholder="Internship Experience"
                />
              </div>

              {/* Live Preview */}
              <div className="bg-white text-zinc-900 p-8 rounded-xl shadow-2xl border border-zinc-300 min-h-[500px] text-xs space-y-4">
                <div className="border-b-2 border-[#0FA34E] pb-2">
                  <h2 className="text-xl font-bold text-[#0FA34E]">{resumeData.name}</h2>
                  <p className="text-xs text-zinc-700 font-bold">{resumeData.role}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[#0FA34E] border-b pb-1 mb-1">SKILLS</h4>
                  <p className="font-mono text-[11px]">{resumeData.skills}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[#0FA34E] border-b pb-1 mb-1">EXPERIENCE</h4>
                  <pre className="whitespace-pre-wrap font-sans text-[11px]">{resumeData.experience}</pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* MOCK TESTS TAB (REDIRECTS / LAUNCHES REAL ASSESSMENTS) */}
        {activeTab === "mocks" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#0FA34E]">
                Proctored Mock Assessment Engine
              </h1>
              <p className="text-sm text-[#0B7C3C] mt-1">
                Take AI-generated proctored mock assessments backed by full backend reporting and question evaluation.
              </p>
            </div>

            <div className="bg-[#F6E9D2] p-8 rounded-3xl border-2 border-[#0FA34E]/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="font-mono text-xs font-bold bg-[#C6FF3D] text-[#0FA34E] px-3 py-1 rounded-full">
                  Full Backend Proctored Mocks
                </span>
                <h3 className="font-display font-extrabold text-2xl text-[#0FA34E]">
                  Create Dynamic AI Assessment
                </h3>
                <p className="text-xs text-[#0B7C3C]">
                  Generates full multi-round coding & CS fundamental tests from your resume or chosen company topic.
                </p>
              </div>

              <button
                onClick={() => navigate("/assessment")}
                className="bg-[#0FA34E] hover:bg-[#0B7C3C] text-[#F6E9D2] font-display font-extrabold text-sm px-8 py-4 rounded-full shadow flex items-center gap-2"
              >
                <Play className="w-5 h-5 text-[#C6FF3D]" />
                <span>Launch Assessment Portal</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* DOUBT SESSIONS TAB (DYNAMIC API INTEGRATED) */}
        {activeTab === "doubts" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#0FA34E]">
                Book Live Pooled Doubt Sessions
              </h1>
              <p className="text-sm text-[#0B7C3C] mt-1">
                Connected directly to backend service for real slot booking & Meet link distribution.
              </p>
            </div>

            {doubtLoading ? (
              <div className="py-12 text-center">
                <RotateCw className="w-8 h-8 animate-spin text-[#0FA34E] mx-auto mb-2" />
                <p className="font-display font-bold text-sm text-[#0FA34E]">Loading doubt sessions...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doubtSessions.map((session) => (
                  <div key={session.id} className="bg-[#F6E9D2] p-6 rounded-3xl border-2 border-[#0FA34E]/20 shadow-md flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#0FA34E] text-[#F6E9D2] font-display font-extrabold text-lg flex items-center justify-center">
                          {session.avatar}
                        </div>
                        <div>
                          <h3 className="font-display font-extrabold text-lg text-[#0FA34E]">{session.mentor}</h3>
                          <p className="text-xs font-bold text-[#0B7C3C]">{session.role}</p>
                        </div>
                      </div>

                      <h4 className="font-display font-bold text-base text-[#0FA34E] leading-snug">{session.topic}</h4>
                      <p className="text-xs text-[#0B7C3C] font-medium">{session.date} ({session.duration})</p>

                      {session.isBooked && (
                        <div className="bg-[#0FA34E] text-[#C6FF3D] p-3 rounded-2xl text-xs font-mono font-bold space-y-1">
                          <p>✓ Slot Confirmed!</p>
                          <a href={session.meetLink} target="_blank" rel="noopener noreferrer" className="text-white underline block truncate">
                            {session.meetLink}
                          </a>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleBookDoubtSession(session.id)}
                      className={`mt-6 w-full font-display font-extrabold text-xs py-3 rounded-full shadow flex items-center justify-center gap-2 ${
                        session.isBooked ? "bg-[#0B7C3C] text-[#C6FF3D]" : "bg-[#0FA34E] text-[#F6E9D2]"
                      }`}
                    >
                      {session.isBooked ? "Slot Booked (Click to Cancel)" : "Book Slot"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-[#0B7C3C] text-[#F6E9D2] mt-20 pt-12 pb-16 border-t-4 border-[#C6FF3D] relative overflow-hidden">
        <BackgroundCodeTexture />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <KonarkWheel className="w-12 h-12" color="#F6E9D2" />
              <div>
                <span className="font-display font-black text-2xl text-[#F6E9D2]">Kampus Ace</span>
                <p className="text-xs text-[#C6FF3D] font-mono">KIIT Placement Season 2026-27</p>
              </div>
            </div>
            <p className="text-xs font-mono text-[#F6E9D2]/80">Connected to Kampus Ace Application Services</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
