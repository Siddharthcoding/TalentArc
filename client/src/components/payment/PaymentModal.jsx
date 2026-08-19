import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Zap, Shield, CheckCircle2, Loader2, AlertCircle, Crown, Calendar } from 'lucide-react';
import { createSubscriptionOrder, verifySubscription } from '@/services/api';

/**
 * Loads Razorpay checkout script dynamically once.
 */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * PaymentModal — handles both Pro subscription (₹49/month) and
 * per-session doubt booking (₹20) via Razorpay Checkout.
 */
export default function PaymentModal({
  isOpen,
  onClose,
  mode = 'subscription',
  user,
  sessionInfo,
  onDoubtOrder,
  onDoubtVerify,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isSubscription = mode === 'subscription';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePay = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Payment gateway failed to load. Check your internet connection.');

      let orderData;
      if (isSubscription) {
        orderData = await createSubscriptionOrder();
      } else {
        orderData = await onDoubtOrder();
      }

      const { orderId, amount, currency, keyId } = orderData;

      await new Promise((resolve, reject) => {
          const options = {
            key: (keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || '').trim(),
            amount,
            currency: currency || 'INR',
            name: 'Kampus Ace',
            description: isSubscription ? 'Pro Plan — ₹49/month' : `Doubt Session — ₹20`,
            order_id: orderId,
            prefill: {
              name: user?.displayName || '',
              email: user?.email || '',
              contact: user?.phone || '',
            },
            theme: { color: '#0FA34E' },
            modal: {
              ondismiss: () => reject(new Error('dismissed')),
              backdropclose: true,
            },
            handler: async (response) => {
              try {
                if (isSubscription) {
                  await verifySubscription({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  });
                } else {
                  await onDoubtVerify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  });
                }
                resolve();
              } catch (err) {
                reject(err);
              }
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', (resp) => {
            reject(new Error(resp.error?.description || 'Payment failed'));
          });
          rzp.open();
        });

      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setLoading(false);
      if (err?.message === 'dismissed') return;
      setError(err?.message || err?.title || 'Payment failed. Please try again.');
    }
  }, [isSubscription, user, onDoubtOrder, onDoubtVerify, onSuccess, onClose]);

  if (!isOpen) return null;

  const proFeatures = [
    'Unlimited ATS Resume Scans',
    'Unlimited JD Matching',
    'Full Company Question Bank Access',
    'Unlimited Mock Tests',
    'Resume Builder — Unlimited Exports',
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto"
      style={{
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md my-auto rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: '#F6E9D2', border: '2px solid rgba(15,163,78,0.25)' }}
      >
        {/* Header */}
        <div
          className="px-7 pt-7 pb-5 flex items-start justify-between"
          style={{ background: 'linear-gradient(135deg, #0FA34E 0%, #0B7C3C 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'rgba(255,255,255,0.2)' }}>
              {isSubscription ? <Crown className="w-6 h-6 text-[#D7F27A]" /> : <Calendar className="w-6 h-6 text-[#D7F27A]" />}
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-[#D7F27A] uppercase tracking-widest">
                {isSubscription ? 'Upgrade to Pro' : 'Book Session'}
              </p>
              <h2 className="font-display font-extrabold text-white text-xl leading-tight">
                {isSubscription ? '₹49 / month' : '₹20 / session'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-7 space-y-5">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#0FA34E] flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-9 h-9 text-white" />
              </div>
              <p className="font-display font-extrabold text-[#0FA34E] text-xl">
                {isSubscription ? 'Pro Activated! 🎉' : 'Session Booked! 🎉'}
              </p>
              <p className="text-sm text-[#0B7C3C] font-medium">
                {isSubscription
                  ? 'Enjoy unlimited access to all features for 30 days.'
                  : 'Check your email for the Google Meet link.'}
              </p>
            </div>
          ) : (
            <>
              {/* What you get */}
              {isSubscription ? (
                <div className="space-y-2">
                  <p className="text-xs font-mono font-bold text-[#0FA34E] uppercase tracking-wider mb-3">
                    What's included
                  </p>
                  {proFeatures.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#0FA34E] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-[#D7F27A]" />
                      </div>
                      <span className="text-xs font-semibold text-[#0B7C3C]">{feat}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(15,163,78,0.08)', border: '1px solid rgba(15,163,78,0.2)' }}>
                  <p className="text-[10px] font-mono font-bold text-[#0FA34E] uppercase tracking-wider">Session Details</p>
                  {sessionInfo && (
                    <>
                      <p className="font-display font-extrabold text-[#0B7C3C] text-sm">{sessionInfo.mentor}</p>
                      <p className="text-xs text-[#0B7C3C] font-medium">{sessionInfo.topic}</p>
                      <p className="text-xs text-[#0FA34E] font-semibold">{sessionInfo.sessionDate}</p>
                    </>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Security note */}
              <div className="flex items-center gap-2 text-[10px] text-[#0B7C3C] font-medium">
                <Shield className="w-3.5 h-3.5 text-[#0FA34E] shrink-0" />
                <span>100% secure payment via Razorpay. Supports UPI, Cards, Net Banking & Wallets.</span>
              </div>

              {/* CTA */}
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-display font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                style={{ background: 'linear-gradient(135deg, #0FA34E 0%, #0B7C3C 100%)', color: '#fff' }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <><Zap className="w-4 h-4 text-[#D7F27A]" /> Pay {isSubscription ? '₹49 via UPI / Card' : '₹20 via UPI / Card'}</>
                )}
              </button>

              {isSubscription && (
                <p className="text-center text-[10px] text-[#0B7C3C] font-medium">
                  Valid for 30 days. Cancel anytime by not renewing.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
