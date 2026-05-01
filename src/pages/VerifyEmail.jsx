import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import authService from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";
import { Button } from '@/components/ui/button';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState(token ? 'verifying' : 'waiting');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendInfo, setResendInfo] = useState('');

  useEffect(() => {
    if (!token) return;
    const verify = async () => {
      try {
        const result = await authService.verifyEmail({ token });
        if (result.user) useAuthStore.getState().setUser(result.user);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err.message || 'Invalid or expired verification link.');
      }
    };
    verify();
  }, [token]);

  const handleResend = async () => {
    setResending(true);
    setResendInfo('');
    try {
      const result = await authService.resendVerification();
      setResendInfo(result?.message || 'A new verification email has been sent.');
    } catch (err) {
      setResendInfo(err.message || 'Could not resend verification email.');
    } finally { setResending(false); }
  };

  const iconConfig = {
    verifying: { icon: Loader2, bg: "bg-muted", className: "animate-spin text-muted-foreground" },
    success: { icon: CheckCircle2, bg: "bg-accent/10", className: "text-accent" },
    error: { icon: XCircle, bg: "bg-destructive/10", className: "text-destructive" },
    waiting: { icon: Mail, bg: "bg-accent/10", className: "text-accent" },
  };

  const cfg = iconConfig[status];
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      {/* Decorative */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-8rem] h-80 w-80 rounded-full bg-accent/[0.04] blur-3xl" />
        <div className="absolute right-[-8rem] bottom-10 h-96 w-96 rounded-full bg-accent/[0.03] blur-3xl" />
      </div>

      <div className="relative w-full max-w-[26rem]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-display font-bold text-foreground tracking-tight">
              JobsDirect<span className="text-accent">.ie</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${cfg.bg}`}>
              <Icon className={`h-7 w-7 ${cfg.className}`} />
            </div>

            {/* Verifying */}
            {status === 'verifying' && (
              <>
                <h1 className="text-xl font-display font-bold text-foreground">Verifying your email...</h1>
                <p className="mt-2 text-sm text-muted-foreground">Please wait while we confirm your email address.</p>
              </>
            )}

            {/* Success */}
            {status === 'success' && (
              <>
                <h1 className="text-xl font-display font-bold text-foreground">Email Verified</h1>
                <p className="mt-2 text-sm text-muted-foreground">Your account is ready. You can now access the full platform.</p>
                <Button
                  className="mt-6 h-11 w-full rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90 group"
                  onClick={() => navigate('/dashboard', { replace: true })}
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </>
            )}

            {/* Error */}
            {status === 'error' && (
              <>
                <h1 className="text-xl font-display font-bold text-foreground">Verification Failed</h1>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                <Button
                  className="mt-6 h-11 w-full rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90"
                  onClick={() => navigate('/auth', { replace: true })}
                >
                  Back to Sign In
                </Button>
              </>
            )}

            {/* Waiting */}
            {status === 'waiting' && (
              <>
                <h1 className="text-xl font-display font-bold text-foreground">Verify Your Email</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We sent a verification link to your email. Click the link to activate your account.
                </p>
                <Button
                  className="mt-6 h-11 w-full rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90"
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : 'Resend Verification Email'}
                </Button>
                {resendInfo && (
                  <p className="mt-3 text-sm text-accent font-medium">{resendInfo}</p>
                )}
                <button
                  type="button"
                  className="mt-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => authService.logout('/auth')}
                >
                  Sign in with a different account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
