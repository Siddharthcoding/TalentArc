import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/SEO';

const TEMPLATES = [
  { id: 'kiit_standard', label: 'KIIT Standard', accent: '#0FA34E', headerBg: '#0FA34E', headerText: '#fff' },
  { id: 'minimal_tech', label: 'Minimal Tech', accent: '#1a1a2e', headerBg: '#fff', headerText: '#1a1a2e' },
  { id: 'executive', label: 'Executive Modern', accent: '#1B3A6B', headerBg: '#1B3A6B', headerText: '#fff' },
  { id: 'compact_dev', label: 'Compact Developer', accent: '#7C3AED', headerBg: '#F5F3FF', headerText: '#4C1D95' },
];

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0] || '').join('').toUpperCase().slice(0, 2);
}

/* ── Template renderers ─────────────────────────────────────────── */

function KiitStandardPreview({ d }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#111', lineHeight: 1.5 }}>
      {/* Header strip */}
      <div style={{ background: '#0FA34E', color: '#fff', padding: '20px 24px 14px', borderRadius: '4px 4px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff', color: '#0FA34E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>
            {getInitials(d.name)}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.3px' }}>{d.name || 'Your Name'}</div>
            <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>{d.role}</div>
            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span>{d.email}</span>
              <span>|</span><span>{d.phone}</span>
              {d.linkedin && <><span>|</span><span>{d.linkedin}</span></>}
              {d.github && <><span>|</span><span>{d.github}</span></>}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '14px 20px', space: 10 }}>
        {d.education && <Section title="EDUCATION" color="#0FA34E"><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.education}</pre></Section>}
        {d.skills && <Section title="TECHNICAL SKILLS" color="#0FA34E"><p style={{ fontFamily: 'Courier New, monospace', fontSize: 10, margin: 0 }}>{d.skills}</p></Section>}
        {d.experience && <Section title="INTERNSHIP & WORK EXPERIENCE" color="#0FA34E"><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.experience}</pre></Section>}
        {d.projects && <Section title="PROJECTS" color="#0FA34E"><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.projects}</pre></Section>}
        {d.achievements && <Section title="ACHIEVEMENTS & CERTIFICATIONS" color="#0FA34E"><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.achievements}</pre></Section>}
      </div>
      <div style={{ textAlign: 'right', padding: '0 20px 10px', fontSize: 8, color: '#aaa', fontFamily: 'monospace' }}>ATS-Optimised • Kampus Ace KIIT</div>
    </div>
  );
}

function MinimalTechPreview({ d }) {
  return (
    <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 11, color: '#1a1a2e', lineHeight: 1.55 }}>
      <div style={{ borderBottom: '3px solid #1a1a2e', paddingBottom: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px' }}>{d.name || 'Your Name'}</div>
        <div style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>{d.role}</div>
        <div style={{ marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 10, color: '#777' }}>
          <span>{d.email}</span>
          <span>{d.phone}</span>
          {d.linkedin && <span>{d.linkedin}</span>}
          {d.github && <span>{d.github}</span>}
        </div>
      </div>
      {d.education && <Section title="Education" color="#1a1a2e" minimal><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.education}</pre></Section>}
      {d.skills && <Section title="Technical Skills" color="#1a1a2e" minimal><p style={{ fontFamily: '"Courier New", monospace', fontSize: 10, margin: 0 }}>{d.skills}</p></Section>}
      {d.experience && <Section title="Experience" color="#1a1a2e" minimal><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.experience}</pre></Section>}
      {d.projects && <Section title="Projects" color="#1a1a2e" minimal><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.projects}</pre></Section>}
      {d.achievements && <Section title="Achievements" color="#1a1a2e" minimal><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.achievements}</pre></Section>}
    </div>
  );
}

function ExecutivePreview({ d }) {
  return (
    <div style={{ fontFamily: 'Georgia, serif', fontSize: 11, color: '#1B3A6B', lineHeight: 1.55 }}>
      <div style={{ background: '#1B3A6B', color: '#fff', padding: '18px 24px', borderRadius: 4 }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>{d.name || 'Your Name'}</div>
        <div style={{ fontSize: 11, opacity: 0.75, letterSpacing: '0.5px', marginTop: 2 }}>{d.role}</div>
        <div style={{ marginTop: 6, display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 9.5, opacity: 0.7 }}>
          <span>{d.email}</span><span>{d.phone}</span>
          {d.linkedin && <span>{d.linkedin}</span>}
          {d.github && <span>{d.github}</span>}
        </div>
      </div>
      <div style={{ padding: '14px 20px' }}>
        {d.education && <Section title="Education" color="#1B3A6B" serif><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.education}</pre></Section>}
        {d.skills && <Section title="Core Competencies" color="#1B3A6B" serif><p style={{ fontFamily: 'monospace', fontSize: 10, margin: 0 }}>{d.skills}</p></Section>}
        {d.experience && <Section title="Professional Experience" color="#1B3A6B" serif><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.experience}</pre></Section>}
        {d.projects && <Section title="Notable Projects" color="#1B3A6B" serif><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.projects}</pre></Section>}
        {d.achievements && <Section title="Achievements" color="#1B3A6B" serif><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.achievements}</pre></Section>}
      </div>
    </div>
  );
}

function CompactDevPreview({ d }) {
  const skills = d.skills.split(',').map((s) => s.trim()).filter(Boolean);
  return (
    <div style={{ fontFamily: '"Segoe UI", sans-serif', fontSize: 11, color: '#111', lineHeight: 1.5 }}>
      {/* Sidebar + main two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', minHeight: 620, gap: 0 }}>
        {/* Sidebar */}
        <div style={{ background: '#F5F3FF', padding: '16px 12px', borderRight: '2px solid #ede9fe' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#7C3AED', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, marginBottom: 10 }}>
            {getInitials(d.name)}
          </div>
          <div style={{ fontWeight: 800, fontSize: 12.5, color: '#4C1D95', wordBreak: 'break-word', lineHeight: 1.25 }}>{d.name || 'Your Name'}</div>
          <div style={{ fontSize: 9.5, color: '#7C3AED', marginBottom: 12, fontWeight: 600 }}>{d.role}</div>
          <div style={{ fontSize: 9, color: '#555', lineHeight: 1.6, wordBreak: 'break-all' }}>
            <div>{d.email}</div>
            <div>{d.phone}</div>
            {d.linkedin && <div>{d.linkedin}</div>}
            {d.github && <div>{d.github}</div>}
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#4C1D95', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {skills.map((sk) => (
                <span key={sk} style={{ fontSize: 8.5, background: '#ede9fe', color: '#5B21B6', padding: '2px 6px', borderRadius: 100, fontWeight: 600 }}>{sk}</span>
              ))}
            </div>
          </div>
        </div>
        {/* Main */}
        <div style={{ padding: '14px 16px' }}>
          {d.education && <Section title="Education" color="#7C3AED" compact><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.education}</pre></Section>}
          {d.experience && <Section title="Experience" color="#7C3AED" compact><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.experience}</pre></Section>}
          {d.projects && <Section title="Projects" color="#7C3AED" compact><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.projects}</pre></Section>}
          {d.achievements && <Section title="Achievements" color="#7C3AED" compact><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 10.5 }}>{d.achievements}</pre></Section>}
        </div>
      </div>
    </div>
  );
}

function Section({ title, color, children, minimal, serif, compact }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 9.5,
        fontWeight: 800,
        color,
        textTransform: 'uppercase',
        letterSpacing: minimal ? 0.5 : 1,
        borderBottom: minimal ? 'none' : `1.5px solid ${color}22`,
        paddingBottom: minimal ? 2 : 3,
        marginBottom: compact ? 4 : 6,
        ...(minimal ? { borderBottom: `1px solid #eee` } : {}),
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

const TEMPLATE_RENDERERS = {
  kiit_standard: KiitStandardPreview,
  minimal_tech: MinimalTechPreview,
  executive: ExecutivePreview,
  compact_dev: CompactDevPreview,
};

const FIELD_LABELS = [
  ['name', 'Full Name'],
  ['role', 'Target Role'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['rollNo', 'Roll No / Batch'],
  ['linkedin', 'LinkedIn URL'],
  ['github', 'GitHub URL'],
  ['education', 'Education & CGPA', 'textarea', 2],
  ['skills', 'Technical Skills (comma separated)', 'textarea', 2],
  ['experience', 'Internship & Work Experience', 'textarea', 4],
  ['projects', 'Projects', 'textarea', 4],
  ['achievements', 'Achievements & Certifications', 'textarea', 3],
];

export default function ResumeBuilder() {
  const { user } = useAuth();
  const printRef = useRef(null);
  const [selectedTemplate, setSelectedTemplate] = useState('kiit_standard');
  const [resumeData, setResumeData] = useState({
    name: '',
    role: 'Software Development Engineer Trainee',
    email: '',
    phone: '+91 ',
    rollNo: '',
    linkedin: 'linkedin.com/in/',
    github: 'github.com/',
    skills: 'Java, C++, Data Structures & Algorithms, React.js, Node.js, Spring Boot, MySQL, Git, Docker, System Design',
    education: 'Kalinga Institute of Industrial Technology (KIIT University), Bhubaneswar\nB.Tech in Computer Science & Engineering (2021 – 2025) | CGPA: 8.85 / 10.0',
    experience: 'Software Engineering Intern @ HighRadius Corporation (May 2024 – July 2024)\n• Developed RESTful microservices in Java Spring Boot, reducing API latency by 28%.\n• Designed React.js dashboard components for financial cash application workflows.',
    projects: 'Kampus Ace – KIIT Campus Placement Hub\n• Built an AI-driven placement preparation platform serving 1,200+ KIIT students.\n• Integrated real-time company round transcripts, ATS scoring, and mock test engine.',
    achievements: 'Cleared HighRadius OA (Round 1 & 2) | Hackathon finalist – KIIT HackNight 2024\nGoogle Cloud Career Practitioner Certificate – 2024',
  });

  useEffect(() => {
    if (user) {
      setResumeData((prev) => ({
        ...prev,
        name: prev.name || user.displayName || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (field, value) => setResumeData((prev) => ({ ...prev, [field]: value }));

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const tpl = TEMPLATES.find((t) => t.id === selectedTemplate);
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>${resumeData.name || 'Resume'} – ${tpl?.label}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: white; }
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; }
        }
      </style>
    </head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const Preview = TEMPLATE_RENDERERS[selectedTemplate];

  return (
    <div className="section-container py-24 space-y-8">
      <SEO
        title="ATS Resume Builder"
        description="Build a job-winning, ATS-optimized resume in minutes with KIIT-specific templates. Choose from multiple layouts, fill in your details, and export to PDF — placement-ready in under 5 minutes."
        path="/resume-builder"
        keywords="ATS resume builder, resume builder KIIT, placement resume template, ATS-friendly resume, KIIT resume"
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-mono text-xs font-bold border shadow-sm mb-2"
            style={{ background: '#F6E9D2', color: '#0FA34E', borderColor: '#0FA34E33' }}>
            <FileText className="w-4 h-4" />
            Single-Page Resume Generator
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold" style={{ color: '#0FA34E' }}>
            KIIT Resume Builder
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: '#0B7C3C' }}>
            4 distinct ATS-optimised templates tailored for campus placement recruiters. Edit fields → export PDF.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90 shadow-md"
          style={{ background: '#0FA34E', color: '#F6E9D2', border: '2px solid rgba(198,255,61,0.4)' }}
        >
          <Printer className="w-4 h-4 text-[#C6FF3D]" />
          Print / Save as PDF
        </button>
      </div>

      {/* Template Picker */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-3xl border-2"
        style={{ background: '#F6E9D2', borderColor: '#0FA34E22' }}>
        <span className="font-bold text-sm mr-2" style={{ color: '#0FA34E', fontFamily: '"Baloo 2", cursive' }}>
          Template:
        </span>
        {TEMPLATES.map((tpl) => (
          <motion.button
            key={tpl.id}
            onClick={() => setSelectedTemplate(tpl.id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 rounded-full font-bold text-xs transition-all"
            style={{
              background: selectedTemplate === tpl.id ? '#0FA34E' : '#DFF5E6',
              color: selectedTemplate === tpl.id ? '#F6E9D2' : '#0FA34E',
              border: `1.5px solid ${selectedTemplate === tpl.id ? '#0FA34E' : '#0FA34E33'}`,
            }}
          >
            {selectedTemplate === tpl.id && '✓ '}{tpl.label}
          </motion.button>
        ))}
      </div>

      {/* Two-column: Form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="rounded-3xl border-2 p-6 sm:p-8 space-y-5 shadow-lg"
          style={{ background: '#F6E9D2', borderColor: '#0FA34E22' }}>
          <h3 className="font-extrabold text-xl border-b pb-3" style={{ fontFamily: '"Baloo 2", cursive', color: '#0FA34E', borderColor: '#0FA34E22' }}>
            Live Details Editor
          </h3>
          <div className="space-y-4">
            {FIELD_LABELS.map(([field, label, type, rows]) => {
              const isTextarea = type === 'textarea';
              const sharedStyle = {
                width: '100%', padding: '9px 14px', borderRadius: 12,
                border: '1.5px solid rgba(15,163,78,0.3)', background: '#D7F27A',
                color: '#0B7C3C', fontSize: 12.5, fontWeight: 600,
                fontFamily: isTextarea && field === 'skills' ? '"JetBrains Mono", monospace' : 'Inter, sans-serif',
                resize: isTextarea ? 'vertical' : undefined, outline: 'none',
              };
              return (
                <div key={field}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#0FA34E' }}>
                    {label}
                  </label>
                  {isTextarea ? (
                    <textarea
                      rows={rows || 3}
                      value={resumeData[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      style={sharedStyle}
                    />
                  ) : (
                    <input
                      type="text"
                      value={resumeData[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      style={sharedStyle}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold px-1" style={{ color: '#0FA34E' }}>
            <span>REAL-TIME PREVIEW ({TEMPLATES.find((t) => t.id === selectedTemplate)?.label.toUpperCase()})</span>
            <span className="px-2.5 py-0.5 rounded-md" style={{ background: '#0FA34E', color: '#F6E9D2' }}>A4 · 1-Page</span>
          </div>

          <div
            ref={printRef}
            className="bg-white rounded-xl shadow-2xl border overflow-hidden"
            style={{ border: '1px solid #e5e7eb', minHeight: 680 }}
          >
            <Preview d={resumeData} />
          </div>

          <p className="text-[11px] font-medium text-center" style={{ color: '#0B7C3C88' }}>
            Click "Print / Save as PDF" → in the print dialog choose "Save as PDF" (destination)
          </p>
        </div>
      </div>
    </div>
  );
}
