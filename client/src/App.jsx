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
import ResumeBuilder from '@/pages/ResumeBuilder';
import DoubtSessions from '@/pages/DoubtSessions';
import DoubtSessionAdmin from '@/pages/DoubtSessionAdmin';
import { useAuth } from '@/context/AuthContext';
import { claimReport } from '@/services/api';
import GoogleButton from '@/components/auth/GoogleButton';

function AuthLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#D7F27A]">
      <div className="flex flex-col items-center gap-4 text-[#0FA34E]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0FA34E]" />
        <p className="text-sm font-mono font-bold">Checking sign in...</p>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated, loading, login } = useAuth();

  if (loading) return <AuthLoading />;
  if (isAuthenticated) return children;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 bg-[#D7F27A]">
      <div className="bg-[#F6E9D2] border-2 border-[#0FA34E]/20 rounded-3xl max-w-md w-full p-8 text-center shadow-2xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#0FA34E] text-[#F6E9D2] flex items-center justify-center mx-auto mb-2 shadow">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-[#0FA34E]">Sign in required</h1>
        <p className="text-sm text-[#0B7C3C] leading-relaxed">
          Sign in with your Google account to access company question banks, detailed ATS reports, and mock assessments.
        </p>
        <div className="pt-2 flex justify-center">
          <GoogleButton onClick={login} />
        </div>
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
    <div className="fixed inset-0 flex items-center justify-center bg-[#D7F27A]">
      <div className="flex flex-col items-center gap-4 text-[#0FA34E]">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-mono font-bold">{message}</p>
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
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/doubt-sessions" element={<DoubtSessions />} />
        <Route path="/doubt-admin" element={<RequireAuth><DoubtSessionAdmin /></RequireAuth>} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Route>
    </Routes>
  );
}
