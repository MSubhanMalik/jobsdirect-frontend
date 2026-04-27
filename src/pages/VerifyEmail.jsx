import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { digify } from '@/api/digifyClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
        await digify.auth.verifyEmail({ token });
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
      const result = await digify.auth.resendVerification();
      setResendInfo(result?.message || 'A new verification email has been sent. Check your inbox.');
    } catch (err) {
      setResendInfo(err.message || 'Could not resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fefefe_0%,#eef4fb_45%,#dfeaf7_100%)] px-3 py-3 sm:px-5 sm:py-5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-md items-center justify-center">
        <Card className="w-full rounded-[22px] border border-white/70 bg-white/95 shadow-[0_18px_54px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:rounded-[24px]">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">

              {/* Verifying (has token, loading) */}
              {status === 'verifying' && (
                <>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Verifying your email...</h1>
                  <p className="mt-2 text-sm text-slate-500">Please wait while we confirm your email address.</p>
                </>
              )}

              {/* Success */}
              {status === 'success' && (
                <>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Email Verified!</h1>
                  <p className="mt-2 text-sm text-slate-500">Your account is ready. You can now access the full platform.</p>
                  <Button
                    className="mt-6 h-12 w-full rounded-[14px] bg-slate-950 text-base font-semibold text-white hover:bg-slate-800"
                    onClick={() => navigate('/dashboard', { replace: true })}
                  >
                    Go to Dashboard
                  </Button>
                </>
              )}

              {/* Error (bad/expired token) */}
              {status === 'error' && (
                <>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Verification Failed</h1>
                  <p className="mt-2 text-sm text-slate-500">{error}</p>
                  <Button
                    className="mt-6 h-12 w-full rounded-[14px] bg-slate-950 text-base font-semibold text-white hover:bg-slate-800"
                    onClick={() => navigate('/auth', { replace: true })}
                  >
                    Back to Sign In
                  </Button>
                </>
              )}

              {/* Waiting (no token — user was redirected here because unverified) */}
              {status === 'waiting' && (
                <>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <Mail className="h-8 w-8 text-amber-600" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Verify Your Email</h1>
                  <p className="mt-2 text-sm text-slate-500">
                    We sent a verification link to your email. Click the link in the email to activate your account.
                  </p>

                  <Button
                    className="mt-6 h-12 w-full rounded-[14px] bg-slate-950 text-base font-semibold text-white hover:bg-slate-800"
                    onClick={handleResend}
                    disabled={resending}
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>

                  {resendInfo && (
                    <p className="mt-3 text-sm text-emerald-600">{resendInfo}</p>
                  )}

                  <button
                    type="button"
                    className="mt-4 text-sm font-medium text-slate-500 hover:text-slate-800"
                    onClick={() => {
                      digify.auth.logout('/auth');
                    }}
                  >
                    Sign in with a different account
                  </button>
                </>
              )}

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
