import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPaymentStatus } from '@/services/api';

const GATED_SERVICES = ['ats', 'jd_match', 'mock_test', 'company_bank'];

export function useAccess() {
  const { isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState({
    hasPro: false,
    subscription: null,
    trialsUsed: [],
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setStatus({ hasPro: false, subscription: null, trialsUsed: [], loading: false, error: null });
      return;
    }
    try {
      setStatus((s) => ({ ...s, loading: true, error: null }));
      const data = await getPaymentStatus();
      setStatus({ hasPro: data.hasPro, subscription: data.subscription, trialsUsed: data.trialsUsed || [], loading: false, error: null });
    } catch {
      setStatus((s) => ({ ...s, loading: false, error: 'Failed to load access status' }));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isAdmin = user?.isAdmin === true;

  /**
   * Returns true if user can access the service right now.
   * Admins always can. Pro users always can. Free users can if trial not used.
   */
  function canAccess(serviceName) {
    if (isAdmin) return true;
    if (status.hasPro) return true;
    if (serviceName === 'company_bank') return false; // no free trial
    return !status.trialsUsed.includes(serviceName);
  }

  function trialUsed(serviceName) {
    if (isAdmin || status.hasPro) return false;
    return status.trialsUsed.includes(serviceName);
  }

  function trialAvailable(serviceName) {
    if (serviceName === 'company_bank') return false;
    return !status.trialsUsed.includes(serviceName);
  }

  return {
    ...status,
    isAdmin,
    canAccess,
    trialUsed,
    trialAvailable,
    refresh,
    GATED_SERVICES,
  };
}
