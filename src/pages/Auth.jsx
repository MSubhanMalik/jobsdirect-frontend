import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Briefcase, KeyRound, Lock, Mail, User } from 'lucide-react';
import authService from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleSignInButton({ onSuccess, onError }) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            onError?.('Google sign-in failed');
          }
        },
      });
      if (btnRef.current) {
        window.google?.accounts.id.renderButton(btnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: btnRef.current.offsetWidth,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [onSuccess, onError]);

  if (!GOOGLE_CLIENT_ID) return null;

  return <div ref={btnRef} className="flex h-12 w-full items-center justify-center sm:h-13" />;
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = useMemo(
    () => new URLSearchParams(location.search).get('redirect') || '/dashboard',
    [location.search]
  );
  const initialResetToken = useMemo(
    () => new URLSearchParams(location.search).get('token') || '',
    [location.search]
  );

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetForm, setResetForm] = useState({
    token: initialResetToken,
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const title =
    mode === 'register'
      ? 'Create your account'
      : mode === 'forgot'
        ? 'Recover your account'
        : mode === 'reset'
          ? 'Set a new password'
          : 'Welcome to JobsDirect.ie';

  const subtitle =
    mode === 'register'
      ? 'Sign up to get started'
      : mode === 'forgot'
        ? 'Enter your email to receive reset instructions'
        : mode === 'reset'
          ? 'Use your token to set a new password'
          : 'Sign in to continue';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setInfo('');

    try {
      if (mode === 'register') {
        const result = await authService.register(form);
        if (result.user) useAuthStore.getState().setUser(result.user);
        navigate('/verify-email', { replace: true });
        return;
      }

      if (mode === 'login') {
        const result = await authService.login(form);
        if (result.user?.emailVerified === false) {
          navigate('/verify-email', { replace: true });
          return;
        }
        if (result.user) useAuthStore.getState().setUser(result.user);
        navigate(redirectTo, { replace: true });
        return;
      }

      if (mode === 'forgot') {
        const result = await authService.forgotPassword({ email: forgotEmail });
        setInfo(
          result.reset_token
            ? `Reset token generated: ${result.reset_token}`
            : result.message || 'Reset instructions generated.'
        );
        setResetForm((current) => ({
          ...current,
          token: result.reset_token || current.token,
          password: '',
        }));
        setMode('reset');
        return;
      }

      await authService.resetPassword(resetForm);
      setInfo('Password reset successful. You can now sign in.');
      setResetForm((current) => ({ ...current, password: '' }));
      setForm((current) => ({ ...current, password: '' }));
      setMode('login');
    } catch (err) {
      setError(err.message || 'Unable to continue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fefefe_0%,#eef4fb_45%,#dfeaf7_100%)] px-3 py-3 sm:px-5 sm:py-5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-slate-200/35 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-md items-center justify-center">
        <Card className="w-full rounded-[22px] border border-white/70 bg-white/95 shadow-[0_18px_54px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:rounded-[24px]">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="mx-auto max-w-[27rem]">
              <div className="mb-4 flex flex-col items-center text-center sm:mb-5">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle,#fff7e8_0%,#fffcf4_55%,#ffffff_100%)] shadow-[0_8px_20px_rgba(15,23,42,0.05)] sm:h-[4.5rem] sm:w-[4.5rem]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-inner sm:h-11 sm:w-11">
                    <Briefcase className="h-6 w-6 text-emerald-700" strokeWidth={1.8} />
                  </div>
                </div>

                <h1 className="font-display text-[1.45rem] font-bold leading-[1] tracking-tight text-slate-950 sm:text-[1.8rem] lg:text-[2rem]">
                  {title}
                </h1>
                <p className="mt-2 max-w-xl text-sm font-medium text-slate-500 sm:text-base">{subtitle}</p>
              </div>

              {(mode === 'login' || mode === 'register') && (
                <>
                  <GoogleSignInButton
                    onSuccess={async (credential) => {
                      setError('');
                      setSubmitting(true);
                      try {
                        const result = await authService.googleAuth(credential);
                        if (result.user) {
                          useAuthStore.getState().setUser(result.user);
                          navigate(redirectTo, { replace: true });
                        }
                      } catch (err) {
                        setError(err.message || 'Google sign-in failed');
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    onError={(msg) => setError(msg)}
                  />

                  <div className="my-4 flex items-center gap-3 sm:my-5">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-semibold tracking-[0.24em] text-slate-400 sm:text-sm">OR</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                </>
              )}

              <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="block text-left text-base font-semibold text-slate-700 sm:text-lg">
                        First name
                      </Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="firstName"
                          type="text"
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                          placeholder="John"
                          className="h-12 rounded-[14px] border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 sm:h-13 sm:text-base"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="block text-left text-base font-semibold text-slate-700 sm:text-lg">
                        Last name
                      </Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="lastName"
                          type="text"
                          value={form.lastName}
                          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                          placeholder="Doe"
                          className="h-12 rounded-[14px] border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 sm:h-13 sm:text-base"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(mode === 'login' || mode === 'register') && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="block text-left text-base font-semibold text-slate-700 sm:text-lg">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="h-12 rounded-[14px] border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 sm:h-13 sm:text-base"
                        required
                      />
                    </div>
                  </div>
                )}

                {(mode === 'login' || mode === 'register') && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="block text-left text-base font-semibold text-slate-700 sm:text-lg">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Enter your password"
                        className="h-12 rounded-[14px] border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 sm:h-13 sm:text-base"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                )}

                {mode === 'forgot' && (
                  <div className="space-y-2">
                    <Label htmlFor="forgotEmail" className="block text-left text-base font-semibold text-slate-700 sm:text-lg">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="forgotEmail"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-12 rounded-[14px] border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 sm:h-13 sm:text-base"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === 'reset' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="resetToken" className="block text-left text-base font-semibold text-slate-700 sm:text-lg">
                        Reset Token
                      </Label>
                      <Input
                        id="resetToken"
                        value={resetForm.token}
                        onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })}
                        placeholder="Paste your reset token"
                        className="h-12 rounded-[14px] border-slate-200 bg-slate-50 px-4 text-sm placeholder:text-slate-400 sm:h-13 sm:text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resetPassword" className="block text-left text-base font-semibold text-slate-700 sm:text-lg">
                        New Password
                      </Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="resetPassword"
                          type="password"
                          value={resetForm.password}
                          onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                          placeholder="Enter a new password"
                          className="h-12 rounded-[14px] border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 sm:h-13 sm:text-base"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {info && (
                  <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{info}</span>
                  </div>
                )}

                <Button
                  className="h-12 w-full rounded-[14px] bg-slate-950 text-base font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition hover:bg-slate-800 sm:h-13 sm:text-lg"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Please wait...'
                    : mode === 'register'
                      ? 'Create account'
                      : mode === 'forgot'
                        ? 'Send reset instructions'
                        : mode === 'reset'
                          ? 'Update password'
                          : 'Sign in'}
                </Button>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm text-slate-500">
                  {mode === 'login' && (
                    <>
                      <button
                        type="button"
                        className="font-medium hover:text-slate-800"
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                          setInfo('');
                          setForgotEmail(form.email);
                        }}
                      >
                        Forgot password?
                      </button>
                      <button
                        type="button"
                        className="font-medium hover:text-slate-800"
                        onClick={() => {
                          setMode('register');
                          setError('');
                          setInfo('');
                        }}
                      >
                        Need an account? <span className="font-semibold text-slate-800">Sign up</span>
                      </button>
                    </>
                  )}

                  {mode === 'register' && (
                    <button
                      type="button"
                      className="ml-auto font-medium hover:text-slate-800"
                      onClick={() => {
                        setMode('login');
                        setError('');
                        setInfo('');
                      }}
                    >
                      Already have an account? <span className="font-semibold text-slate-800">Sign in</span>
                    </button>
                  )}

                  {mode === 'forgot' && (
                    <button
                      type="button"
                      className="ml-auto font-medium hover:text-slate-800"
                      onClick={() => {
                        setMode('login');
                        setError('');
                        setInfo('');
                      }}
                    >
                      Back to sign in
                    </button>
                  )}

                  {mode === 'reset' && (
                    <button
                      type="button"
                      className="ml-auto font-medium hover:text-slate-800"
                      onClick={() => {
                        setMode('login');
                        setError('');
                        setInfo('');
                      }}
                    >
                      Return to sign in
                    </button>
                  )}
                </div>
              </form>

              <p className="mt-5 text-center text-[11px] leading-5 text-slate-400 sm:mt-6 sm:text-xs">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="font-medium text-slate-700 hover:underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="font-medium text-slate-700 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
