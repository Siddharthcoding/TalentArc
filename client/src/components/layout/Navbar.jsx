import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogOut, FileText, Building2, FileCheck,
  Sliders, Target, Users, LayoutDashboard, Settings, Crown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';


const KonarkWheel = ({ className = 'w-7 h-7', color = '#0FA34E' }) => (
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
          <line x1="100" y1="30" x2="100" y2="70" stroke={color} strokeWidth={isMajor ? '4' : '2'} />
          {isMajor && <circle cx="100" cy="50" r="4" fill="#C6FF3D" stroke={color} strokeWidth="1.5" />}
        </g>
      );
    })}
  </svg>
);

const navLinks = [
  { href: '/', label: 'Home', exact: true },
  { href: '/dashboard', label: 'ATS Checker' },
  { href: '/jd-matcher', label: 'JD Matcher' },
  { href: '/company-bank', label: 'Company Bank' },
  { href: '/assessment', label: 'Mock Tests' },
  { href: '/resume-builder', label: 'Resume Builder' },
  { href: '/doubt-sessions', label: 'Doubt Sessions' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Help' },
];

function UserAvatar({ user, className }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (user.avatarUrl && !imgFailed) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={className}
      />
    );
  }
  return (
    <span className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
      {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
    </span>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const avatarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, user, login, logout } = useAuth();

  const isAdmin = Boolean(user?.isAdmin);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === 'Escape') {
        setAvatarOpen(false);
        setMobileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => { setMobileOpen(false); setAvatarOpen(false); }, [location.pathname]);

  const closeMenus = () => {
    setMobileOpen(false);
    setAvatarOpen(false);
  };

  const handleMenuLinkClick = (e, href) => {
    e.preventDefault();
    flushSync(closeMenus);
    navigate(href);
  };

  const handleAuthAction = (action) => {
    flushSync(closeMenus);
    action();
  };

  const isActive = (link) =>
    link.exact
      ? location.pathname === link.href
      : location.pathname === link.href || location.pathname.startsWith(link.href + '/');

  return (
    <header
      ref={navRef}
      className="sticky top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(215, 242, 122, 0.97)' : '#D7F27A',
        borderBottom: scrolled ? '1.5px solid rgba(15, 163, 78, 0.18)' : '1.5px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 4px 24px rgba(11,124,60,0.10)' : 'none',
      }}
    >

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-4">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group select-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="shrink-0"
          >
            <KonarkWheel className="w-8 h-8" color="#0FA34E" />
          </motion.div>
          <div className="leading-none">
            <span
              className="font-display text-[18px] sm:text-xl font-extrabold tracking-tight block"
              style={{ color: '#0B7C3C', fontFamily: '"Baloo 2", cursive' }}
            >
              Kampus Ace
            </span>
            <span className="text-[9px] font-mono font-bold tracking-widest hidden sm:block" style={{ color: '#0FA34E' }}>
              KIIT PLACEMENT HUB
            </span>
          </div>
          <span
            className="hidden sm:inline-flex items-center font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{ background: '#0FA34E', color: '#C6FF3D' }}
          >
            '27
          </span>
        </Link>

        {/* Desktop nav — pill group */}
        <nav
          className="hidden lg:flex items-center gap-0.5 p-1 rounded-full"
          style={{ background: 'rgba(11,124,60,0.08)', border: '1.5px solid rgba(15,163,78,0.2)' }}
        >
          {navLinks.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'relative px-3.5 py-1.5 rounded-full text-[11.5px] font-bold transition-all select-none whitespace-nowrap',
                  active ? 'text-[#F6E9D2]' : 'text-[#0B7C3C] hover:text-[#0FA34E] hover:bg-[#0FA34E12]'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill-active"
                    className="absolute inset-0 rounded-full"
                    style={{ background: '#0FA34E' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2 shrink-0">
          {loading ? (
            <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: '#0FA34E22' }} />
          ) : isAuthenticated && user ? (
            <div className="relative" ref={avatarRef}>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setAvatarOpen((open) => !open);
                }}
                className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full transition-all hover:shadow-md"
                style={{
                  background: '#F6E9D2',
                  border: '1.5px solid rgba(15,163,78,0.3)',
                }}
              >
                <span
                  className="font-bold text-xs hidden sm:block max-w-[100px] truncate"
                  style={{ color: '#0B7C3C', fontFamily: '"Baloo 2", cursive' }}
                >
                  {user.displayName?.split(' ')[0]}
                </span>
                <div
                  className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shadow-sm"
                  style={{ background: '#0FA34E', color: '#F6E9D2' }}
                >
                  <UserAvatar user={user} className="w-full h-full object-cover" />
                </div>
              </button>

              <AnimatePresence>
                {avatarOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-58 rounded-3xl p-2 shadow-2xl z-50 text-left"
                    style={{ background: '#F6E9D2', border: '2px solid rgba(15,163,78,0.25)', minWidth: 220 }}
                  >
                    {/* User identity */}
                    <div className="px-3 py-2.5 border-b mb-1" style={{ borderColor: 'rgba(15,163,78,0.12)' }}>
                      <p className="font-bold text-sm truncate" style={{ color: '#0FA34E', fontFamily: '"Baloo 2", cursive' }}>
                        {user.displayName || 'Student'}
                      </p>
                      <p className="text-[11px] font-mono truncate" style={{ color: '#0B7C3C88' }}>
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/reports"
                      onClick={(e) => handleMenuLinkClick(e, '/reports')}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold transition-colors hover:bg-[#D7F27A]"
                      style={{ color: '#0FA34E' }}
                    >
                      <FileText className="w-4 h-4" />
                      My Saved Reports
                    </Link>

                    <Link
                      to="/pricing"
                      onClick={(e) => handleMenuLinkClick(e, '/pricing')}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold transition-colors hover:bg-[#D7F27A]"
                      style={{ color: '#0FA34E' }}
                    >
                      <Crown className="w-4 h-4 text-[#0FA34E]" />
                      Pricing &amp; Pro Plan (₹49)
                    </Link>

                    {isAdmin && (
                      <>
                        <Link
                          to="/admin/company-bank"
                          onClick={(e) => handleMenuLinkClick(e, '/admin/company-bank')}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold transition-colors hover:bg-[#D7F27A]"
                          style={{ color: '#0FA34E' }}
                        >
                          <Building2 className="w-4 h-4" />
                          Company Bank Admin
                        </Link>
                        <Link
                          to="/doubt-admin"
                          onClick={(e) => handleMenuLinkClick(e, '/doubt-admin')}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold transition-colors hover:bg-[#D7F27A]"
                          style={{ color: '#0FA34E' }}
                        >
                          <Settings className="w-4 h-4" />
                          Doubt Session Admin
                        </Link>
                      </>
                    )}

                    <div className="mt-1 pt-1 border-t" style={{ borderColor: 'rgba(15,163,78,0.12)' }}>
                      <button
                        type="button"
                        onClick={() => handleAuthAction(logout)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-2xl text-xs font-bold transition-colors hover:bg-red-50"
                        style={{ color: '#E1584A' }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleAuthAction(login)}
              className="flex items-center gap-2 font-bold text-xs px-4 py-2 rounded-full transition-all hover:opacity-90 shadow-md"
              style={{
                background: '#0FA34E',
                color: '#F6E9D2',
                border: '1.5px solid rgba(198,255,61,0.4)',
                fontFamily: '"Baloo 2", cursive',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z" />
                <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Sign In
            </button>
          )}

          {/* Mobile burger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              flushSync(() => {
                setAvatarOpen(false);
                setMobileOpen((open) => !open);
              });
            }}
            className="lg:hidden p-2 rounded-full transition-colors"
            style={{ background: '#0FA34E22', color: '#0FA34E' }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => flushSync(closeMenus)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
            />
            <div
              className="fixed right-3 top-[68px] z-50 lg:hidden w-[min(calc(100vw-24px),24rem)] overflow-hidden rounded-3xl p-2 text-left shadow-2xl"
              style={{ background: '#F6E9D2', border: '2px solid rgba(15,163,78,0.25)' }}
            >
              {isAuthenticated && user && (
                <div className="px-3 py-2.5 border-b mb-1" style={{ borderColor: 'rgba(15,163,78,0.12)' }}>
                  <p className="font-bold text-sm truncate" style={{ color: '#0FA34E', fontFamily: '"Baloo 2", cursive' }}>
                    {user.displayName || 'Student'}
                  </p>
                  <p className="text-[11px] font-mono truncate" style={{ color: '#0B7C3C88' }}>
                    {user.email}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const active = isActive(link);
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={(e) => handleMenuLinkClick(e, link.href)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-2xl text-sm font-bold transition-colors',
                        active
                          ? 'text-[#F6E9D2]'
                          : 'text-[#0B7C3C] hover:bg-[#D7F27A]'
                      )}
                      style={active ? { background: '#0FA34E' } : {}}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                {/* Mobile sign in / out */}
                <div className="pt-1 mt-1 border-t" style={{ borderColor: 'rgba(15,163,78,0.12)' }}>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => handleAuthAction(logout)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-2xl text-sm font-bold transition-colors hover:bg-red-50"
                      style={{ color: '#E1584A' }}
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAuthAction(login)}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-2xl font-bold text-sm shadow-sm"
                      style={{ background: '#0FA34E', color: '#F6E9D2' }}
                    >
                      Sign In with Google
                    </button>
                  )}
                </div>
              </div>
            </div>
        </>
      )}
    </header>
  );
}
