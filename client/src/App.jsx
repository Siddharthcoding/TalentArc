import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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
import { useAuth } from '@/context/AuthContext';
import { claimReport } from '@/services/api';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
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
      <Route path="/assessment/:id" element={<AssessmentSession />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jd-matcher" element={<JdMatcher />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/assessment" element={<AssessmentLanding />} />
        <Route path="/assessment/:id/report" element={<AssessmentReport />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Route>
    </Routes>
  );
}
