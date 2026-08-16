import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  FileCheck,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  FileText,
  Sliders,
  Award,
  Code2,
  BookOpen,
  ChevronRight
} from 'lucide-react';

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
  </svg>
);

const RangoliDotRule = () => (
  <div className="w-full flex items-center justify-center gap-2 my-8 opacity-90 select-none">
    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#0FA34E]/30 to-[#0FA34E]" />
    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F6E9D2] border border-[#0FA34E]/30 rounded-full text-[#0FA34E] shadow-sm">
      <svg className="w-4 h-4 text-[#0FA34E]" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
      </svg>
      <div className="w-2 h-2 rounded-full bg-[#0FA34E]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#C6FF3D] border border-[#0FA34E]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#0FA34E]" />
      <svg className="w-4 h-4 text-[#0FA34E]" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
      </svg>
    </div>
    <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#0FA34E]/30 to-[#0FA34E]" />
  </div>
);

export default function Hero() {
  return (
    <div className="section-container pt-8 sm:pt-12 pb-14 sm:pb-18 space-y-12 sm:space-y-16">
      
      {/* HERO MAIN HEADER */}
      <div className="relative pt-4 pb-4 rounded-3xl overflow-hidden">

        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* Left Text Column */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            
            {/* Black Speech-Bubble Stamp Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-block transform -rotate-2 hover:rotate-0 transition-transform"
            >
              <div className="bg-black text-[#C6FF3D] font-mono text-xs sm:text-sm font-extrabold uppercase tracking-wider px-4 py-2 rounded-2xl border-2 border-[#C6FF3D] shadow-lg flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C6FF3D]" />
                <span>★ IF IT'S NOT VERIFIED, IT'S NOT HERE</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0FA34E] tracking-tight leading-[1.06]"
            >
              Placements you don't have to second guess.
            </motion.h1>

            {/* Cursive Tagline with Marigold Accent */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative inline-block"
            >
              <p className="font-cursive text-2xl sm:text-3xl text-[#0B7C3C] font-bold tracking-wide transform rotate-[-1deg]">
                "Worried about Placements?? You need not, till Kampus Ace is here"
              </p>
              <svg className="w-full h-3 text-[#E8A33D] mt-0.5" viewBox="0 0 300 12" fill="none">
                <path d="M5 8 C 50 2, 150 11, 295 4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </motion.div>

            {/* CTA Pill Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                to="/company-bank"
                className="bg-[#0FA34E] hover:bg-[#0B7C3C] text-[#F6E9D2] font-display font-extrabold text-base sm:text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-3 border-2 border-[#C6FF3D]/40"
              >
                <Building2 className="w-5 h-5 text-[#C6FF3D]" />
                <span>Browse 40+ Companies</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/dashboard"
                className="bg-[#F6E9D2] hover:bg-[#F6E9D2]/90 text-[#0FA34E] font-display font-extrabold text-base sm:text-lg px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 border-2 border-[#0FA34E] flex items-center gap-3"
              >
                <FileCheck className="w-5 h-5 text-[#0FA34E]" />
                <span>Check ATS Score</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Rotating Konark Sun Wheel Hero Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative flex items-center justify-center p-8 bg-[#F6E9D2]/80 rounded-3xl border-2 border-[#0FA34E]/25 shadow-xl shrink-0"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            >
              <KonarkWheel className="w-56 h-56 sm:w-72 sm:h-72" color="#0FA34E" />
            </motion.div>
            
            <div className="absolute bg-[#0FA34E] text-[#F6E9D2] font-display font-bold text-center px-4 py-2.5 rounded-full shadow-xl border-2 border-[#C6FF3D] text-xs sm:text-sm pointer-events-none">
              KIIT Placement<br/><span className="text-[#C6FF3D] font-mono text-xs">Season 2026-27</span>
            </div>
          </motion.div>
        </div>
      </div>

      <RangoliDotRule />

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { count: "40+", label: "Recruiters Tracked", sub: "HighRadius, Deloitte, Microsoft", icon: Building2, color: "bg-[#F6E9D2]" },
          { count: "1,450+", label: "DSA & SQL Questions", sub: "Topic-wise KIIT PYQs", icon: Code2, color: "bg-[#DFF5E6]" },
          { count: "180+", label: "Mock Assessments", sub: "Proctored Mocks & Quizzes", icon: Target, color: "bg-[#F6E9D2]" },
          { count: "95+", label: "Core CS Topics", sub: "OS, DBMS, Networks, LLD", icon: BookOpen, color: "bg-[#DFF5E6]" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`${stat.color} p-6 rounded-3xl border-2 border-[#0FA34E]/20 shadow-md text-left flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0FA34E] text-[#F6E9D2] flex items-center justify-center shadow-md">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-bold text-[#0FA34E] bg-[#0FA34E]/10 px-2.5 py-1 rounded-full">
                  Verified
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

    </div>
  );
}
