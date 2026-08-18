import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck } from 'lucide-react';

const KonarkWheel = ({ className = "w-10 h-10", color = "#F6E9D2" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="92" stroke={color} strokeWidth="6" strokeDasharray="12 6" />
    <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="4" />
    <circle cx="100" cy="100" r="30" stroke={color} strokeWidth="5" fill="#0B7C3C" />
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

export default function Footer() {
  return (
    <footer className="bg-[#0B7C3C] text-[#F6E9D2] mt-20 pt-12 pb-16 border-t-4 border-[#C6FF3D] relative overflow-hidden select-none">
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] font-mono text-xs text-[#C6FF3D] z-0">
        <div className="absolute top-8 left-[5%] rotate-[-6deg]">O(log n)</div>
        <div className="absolute top-20 right-[8%] rotate-[12deg]">T(n) = 2T(n/2) + O(n)</div>
        <div className="absolute top-40 left-[25%] rotate-[-4deg]">SELECT * FROM KIIT_Placements;</div>
      </div>

      <div className="section-container relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <KonarkWheel className="w-12 h-12" color="#F6E9D2" />
            <div>
              <span className="font-display font-black text-2xl text-[#F6E9D2] tracking-tight">
                Kampus Ace
              </span>
              <p className="text-xs text-[#C6FF3D] font-mono">
                FirstClub for KIIT Placement Season
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 text-xs font-display font-bold text-[#F6E9D2]">
            <Link to="/dashboard" className="hover:text-[#C6FF3D] transition-colors">ATS Checker</Link>
            <Link to="/jd-matcher" className="hover:text-[#C6FF3D] transition-colors">JD Matcher</Link>
            <Link to="/company-bank" className="hover:text-[#C6FF3D] transition-colors">Company Bank</Link>
            <Link to="/assessment" className="hover:text-[#C6FF3D] transition-colors">Mock Assessment</Link>
            <Link to="/resume-builder" className="hover:text-[#C6FF3D] transition-colors">Resume Builder</Link>
            <Link to="/doubt-sessions" className="hover:text-[#C6FF3D] transition-colors">Doubt Sessions</Link>
            <Link to="/pricing" className="hover:text-[#C6FF3D] transition-colors">Pricing &amp; Plans</Link>
            <Link to="/contact" className="text-[#C6FF3D] hover:underline transition-all">Help &amp; Contact</Link>
          </div>
        </div>

        <div className="pt-6 border-t border-[#F6E9D2]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F6E9D2]/80 font-mono">
          <p>© {new Date().getFullYear()} Kampus Ace • KIIT University, Bhubaneswar, Odisha.</p>
          <div className="flex items-center gap-2 text-[#C6FF3D]">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Verified Recruiter Transcripts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
