import { useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import FeaturesPage from '@/pages/FeaturesPage';
import PricingPage from '@/pages/PricingPage';
import JdMatcher from '@/pages/JdMatcher';
import Reports from '@/pages/Reports';
import ReportDetail from '@/pages/ReportDetail';
import AssessmentLanding from '@/pages/AssessmentLanding';
import AssessmentSession from '@/pages/AssessmentSession';
import AssessmentReport from '@/pages/AssessmentReport';
import CompanyBank from '@/pages/CompanyBank';
import CompanyBankDetail from '@/pages/CompanyBankDetail';
import CompanyBankAdmin from '@/pages/CompanyBankAdmin';
import { useAuth } from '@/context/AuthContext';
import { claimReport } from '@/services/api';
import GoogleButton from '@/components/auth/GoogleButton';

function AuthLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Checking sign in...</p>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated, loading, login } = useAuth();

  if (loading) return <AuthLoading />;
  if (isAuthenticated) return children;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 bg-white dark:bg-zinc-950">
      <div className="glass-card max-w-md w-full p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-indigo-500" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Sign in required</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Sign in to view company question banks and mock assessments.
        </p>
        <GoogleButton onClick={login} />
      </div>
    </div>
  );
}

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [message, setMessage] = useState('Completing sign in...');
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      navigate('/', { replace: true });
      return;
    }

    setToken(token).then(async () => {
      const pending = sessionStorage.getItem('pendingReport');
      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          if (parsed.data?.tempUuid) {
            setMessage('Saving your report...');
            await claimReport(parsed.data.tempUuid);
            sessionStorage.setItem('pendingReport', JSON.stringify({ ...parsed, claimed: true }));
          }
        } catch {
        }
      }
      const redirectTo = sessionStorage.getItem('authRedirect') || '/';
      sessionStorage.removeItem('authRedirect');
      navigate(redirectTo, { replace: true });
    }).catch(() => {
      navigate('/', { replace: true });
    });
  }, [searchParams, navigate, setToken]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/assessment/:id" element={<RequireAuth><AssessmentSession /></RequireAuth>} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jd-matcher" element={<JdMatcher />} />
        <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
        <Route path="/reports/:id" element={<RequireAuth><ReportDetail /></RequireAuth>} />
        <Route path="/assessment" element={<RequireAuth><AssessmentLanding /></RequireAuth>} />
        <Route path="/assessment/:id/report" element={<RequireAuth><AssessmentReport /></RequireAuth>} />
        <Route path="/company-bank" element={<RequireAuth><CompanyBank /></RequireAuth>} />
        <Route path="/company-bank/:id" element={<RequireAuth><CompanyBankDetail /></RequireAuth>} />
        <Route path="/admin/company-bank" element={<CompanyBankAdmin />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Route>
    </Routes>
  );
}
