import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound, Lock, Mail, User, Loader2 } from 'lucide-react';
import authService from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";
import { Button } from '@/components/ui/button';
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
          if (response.credential) onSuccess(response.credential);
          else onError?.('Google sign-in failed');
        },
      });
      if (btnRef.current) {
        window.google?.accounts.id.renderButton(btnRef.current, {
          type: 'standard', theme: 'outline', size: 'large',
          text: 'continue_with', width: btnRef.current.offsetWidth,
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [onSuccess, onError]);

  if (!GOOGLE_CLIENT_ID) return null;
  return <div ref={btnRef} className="flex h-12 w-full items-center justify-center" />;
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = useMemo(() => new URLSearchParams(location.search).get('redirect') || '/dashboard', [location.search]);
  const initialResetToken = useMemo(() => new URLSearchParams(location.search).get('token') || '', [location.search]);

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetForm, setResetForm] = useState({ token: initialResetToken, password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const title = mode === 'register' ? 'Create your account'
    : mode === 'forgot' ? 'Recover your account'
    : mode === 'reset' ? 'Set a new password'
    : 'Welcome back';

  const subtitle = mode === 'register' ? 'Sign up to get started'
    : mode === 'forgot' ? 'Enter your email to receive reset instructions'
    : mode === 'reset' ? 'Use your token to set a new password'
    : 'Sign in to your JobsDirect.ie account';

  const switchMode = (newMode) => { setMode(newMode); setError(''); setInfo(''); };

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
        if (result.user?.emailVerified === false) { navigate('/verify-email', { replace: true }); return; }
        if (result.user) useAuthStore.getState().setUser(result.user);
        navigate(redirectTo, { replace: true });
        return;
      }
      if (mode === 'forgot') {
        const result = await authService.forgotPassword({ email: forgotEmail });
        setInfo(result.reset_token ? `Reset token generated: ${result.reset_token}` : result.message || 'Reset instructions generated.');
        setResetForm((c) => ({ ...c, token: result.reset_token || c.token, password: '' }));
        setMode('reset');
        return;
      }
      await authService.resetPassword(resetForm);
      setInfo('Password reset successful. You can now sign in.');
      setResetForm((c) => ({ ...c, password: '' }));
      setForm((c) => ({ ...c, password: '' }));
      setMode('login');
    } catch (err) {
      setError(err.message || 'Unable to continue. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      {/* Decorative */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-8rem] h-80 w-80 rounded-full bg-accent/[0.04] blur-3xl" />
        <div className="absolute right-[-8rem] top-20 h-96 w-96 rounded-full bg-accent/[0.03] blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-muted/50 blur-3xl" />
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
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {/* Google */}
          {(mode === 'login' || mode === 'register') && (
            <>
              <GoogleSignInButton
                onSuccess={async (credential) => {
                  setError(''); setSubmitting(true);
                  try {
                    const result = await authService.googleAuth(credential);
                    if (result.user) { useAuthStore.getState().setUser(result.user); navigate(redirectTo, { replace: true }); }
                  } catch (err) { setError(err.message || 'Google sign-in failed'); }
                  finally { setSubmitting(false); }
                }}
                onError={(msg) => setError(msg)}
              />
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                    <Input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" className="h-11 pl-10 rounded-xl" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                    <Input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" className="h-11 pl-10 rounded-xl" required />
                  </div>
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="h-11 pl-10 rounded-xl" required />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                  <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" className="h-11 pl-10 rounded-xl" required minLength={6} />
                </div>
              </div>
            )}

            {mode === 'forgot' && (
              <div className="space-y-1.5">
                <Label htmlFor="forgotEmail" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                  <Input id="forgotEmail" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" className="h-11 pl-10 rounded-xl" required />
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="resetToken" className="text-sm font-medium">Reset Token</Label>
                  <Input id="resetToken" value={resetForm.token} onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })} placeholder="Paste your reset token" className="h-11 rounded-xl" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="resetPassword" className="text-sm font-medium">New Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                    <Input id="resetPassword" type="password" value={resetForm.password} onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })} placeholder="Enter a new password" className="h-11 pl-10 rounded-xl" required minLength={6} />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {info && (
              <div className="flex items-start gap-2.5 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{info}</span>
              </div>
            )}

            <Button
              className="h-11 w-full rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90"
              type="submit"
              disabled={submitting}
            >
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Please wait...</>
                : mode === 'register' ? 'Create account'
                : mode === 'forgot' ? 'Send reset instructions'
                : mode === 'reset' ? 'Update password'
                : 'Sign in'}
            </Button>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm text-muted-foreground">
              {mode === 'login' && (
                <>
                  <button type="button" className="font-medium hover:text-foreground transition-colors" onClick={() => { switchMode('forgot'); setForgotEmail(form.email); }}>
                    Forgot password?
                  </button>
                  <button type="button" className="font-medium hover:text-foreground transition-colors" onClick={() => switchMode('register')}>
                    Need an account? <span className="font-semibold text-foreground">Sign up</span>
                  </button>
                </>
              )}
              {mode === 'register' && (
                <button type="button" className="ml-auto font-medium hover:text-foreground transition-colors" onClick={() => switchMode('login')}>
                  Already have an account? <span className="font-semibold text-foreground">Sign in</span>
                </button>
              )}
              {(mode === 'forgot' || mode === 'reset') && (
                <button type="button" className="ml-auto font-medium hover:text-foreground transition-colors" onClick={() => switchMode('login')}>
                  Back to sign in
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-[0.65rem] leading-5 text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="font-medium text-foreground hover:underline">Terms</Link>{' '}and{' '}
            <Link to="/privacy" className="font-medium text-foreground hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
