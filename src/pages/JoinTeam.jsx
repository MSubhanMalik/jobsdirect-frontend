import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { setAccessToken } from "@/services/AxiosService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { AlertCircle, Building2, Lock, Loader2, User } from "lucide-react";
import axiosInstance from "@/services/AxiosService";

export default function JoinTeam() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ first_name: "", last_name: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setError("No invitation token provided."); setLoading(false); return; }
    axiosInstance.get(`/api/team/invite-details?token=${token}`)
      .then((res) => {
        const data = res.data?.data || res.data;
        setInvite(data);
      })
      .catch((err) => setError(err.message || "Invalid or expired invitation."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await axiosInstance.post("/api/team/signup-and-accept", {
        token,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
      });
      const result = res.data?.data || res.data;
      if (result.accessToken) setAccessToken(result.accessToken);
      if (result.user) useAuthStore.getState().setUser(result.user);
      toast.success("Welcome to the team!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-8rem] h-80 w-80 rounded-full bg-accent/[0.04] blur-3xl" />
        <div className="absolute right-[-8rem] top-20 h-96 w-96 rounded-full bg-accent/[0.03] blur-3xl" />
      </div>

      <div className="relative w-full max-w-[26rem]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-display font-bold text-foreground tracking-tight">
              JobsDirect<span className="text-accent">.ie</span>
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8">
          {loading ? (
            <div className="space-y-4 py-8">
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          ) : error && !invite ? (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-destructive/30 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">Invalid Invitation</h2>
              <p className="text-sm text-muted-foreground mb-6">{error}</p>
              <Button asChild variant="outline"><Link to="/auth">Go to Login</Link></Button>
            </div>
          ) : invite ? (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-7 h-7 text-accent" />
                </div>
                <h1 className="text-xl font-display font-bold text-foreground">Join {invite.company_name}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  You've been invited as <span className="font-semibold text-foreground capitalize">{invite.role}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded-lg px-3 py-1.5 inline-block">{invite.email}</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">First name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                      <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="John" className="h-11 pl-10 rounded-xl" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Last name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                      <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Doe" className="h-11 pl-10 rounded-xl" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Create a password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                    <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" className="h-11 pl-10 rounded-xl" required minLength={8} />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button className="h-11 w-full rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90" type="submit" disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : "Create Account & Join Team"}
                </Button>
              </form>

              <p className="mt-6 text-center text-[0.65rem] leading-5 text-muted-foreground">
                By joining, you agree to our{" "}
                <Link to="/terms" className="font-medium text-foreground hover:underline">Terms</Link>{" "}and{" "}
                <Link to="/privacy" className="font-medium text-foreground hover:underline">Privacy Policy</Link>.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
