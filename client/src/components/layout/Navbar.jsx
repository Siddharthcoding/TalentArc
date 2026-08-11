import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Sparkles, LogOut, FileText } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

const guestLinks = [
  { href: '/', label: 'ATS Checker' },
  { href: '/jd-matcher', label: 'JD Matcher' },
  { href: '/assessment', label: 'Mock Assessment' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/features', label: 'Docs' },
];

const authLinks = [
  { href: '/', label: 'ATS Checker' },
  { href: '/jd-matcher', label: 'JD Matcher' },
  { href: '/assessment', label: 'Mock Assessment' },
  { href: '/reports', label: 'My Reports' },
  { href: '/features', label: 'Docs' },
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
    <span className={className}>
      {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
    </span>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);
  const location = useLocation();
  const { isAuthenticated, user, login, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = isAuthenticated ? authLinks : guestLinks;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'glass border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="section-container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Talent<span className="gradient-text">Arc</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                link.href !== '/' && location.pathname.startsWith(link.href)
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                  : location.pathname === link.href
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/20 transition-shadow"
                aria-label="User menu"
              >
                <UserAvatar
                  user={user}
                  className="w-full h-full rounded-full object-cover"
                />
              </button>

              <AnimatePresence>
                {avatarOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 glass-card p-1.5 shadow-lg"
                  >
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/reports"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      My Reports
                    </Link>
                    <button
                      onClick={() => { setAvatarOpen(false); logout(); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <button
                onClick={login}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z" />
                  <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Sign in
              </button>
              <Link to="/dashboard" className="hidden md:block">
                <AnimatedButton variant="primary" className="text-sm !px-5 !py-2.5 group">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </AnimatedButton>
              </Link>
            </>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden"
          >
            <div className="section-container py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href))
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && user && (
                <div className="pt-2 pb-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                      <UserAvatar
                        user={user}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user.displayName}</p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); logout(); }}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
              {!isAuthenticated && (
                <>
                  <button
                    onClick={() => { setMobileOpen(false); login(); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                      <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z" />
                      <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    Sign in with Google
                  </button>
                  <Link to="/dashboard" className="block pt-2">
                    <AnimatedButton variant="primary" className="w-full text-sm !px-5 !py-3 group">
                      Get Started
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </AnimatedButton>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
