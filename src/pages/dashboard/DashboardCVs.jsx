import React, { useEffect, useRef, useState } from "react";
import { useOutletContext, Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { FileText, Upload, Star, Trash2, Download, Wand2, Lock, Palette, Crown, Loader2, ArrowRight } from "lucide-react";
import cvService from "@/services/cv";
import paymentService from "@/services/payment";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const TEMPLATE_INFO = {
  basic: { label: "Basic", description: "Clean, minimal — blue accent headers" },
  modern: { label: "Modern", description: "Contemporary with Inter font — blue theme" },
  executive: { label: "Executive", description: "Serif font, dark tones — formal style" },
  creative: { label: "Creative", description: "Poppins font, purple accent — standout design" },
};

const PLAN_INFO = {
  free: { label: "Free", color: "bg-muted text-muted-foreground" },
  professional: { label: "Professional", color: "bg-blue-50 text-blue-700 border-blue-200" },
  premium: { label: "Premium", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

function formatPlanPrice(plan) {
  const amount = Number(plan.amount || 0) / 100;
  if (amount === 0) return "Free";
  return `€${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
}

export default function DashboardCVs() {
  const { user } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [checkoutPlanId, setCheckoutPlanId] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [plan, setPlan] = useState("free");
  const [limits, setLimits] = useState({ maxCVs: 1, templates: ["basic"], watermark: true });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("basic");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileRef = useRef(null);

  // Fetch CV plan products from payment plans
  const { data: allPlans = [] } = useQuery({
    queryKey: ["payment-plans"],
    queryFn: () => paymentService.listPlans(),
    staleTime: 10 * 60 * 1000,
  });
  const cvPlans = allPlans.filter((p) => p.kind === "cv_plan" || p.type === "cv_plan");

  // Handle payment redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");
    if (payment === "success" && sessionId) {
      paymentService.syncCheckoutSession(sessionId).then(() => {
        toast.success("CV plan upgraded!");
        refresh();
      }).catch(() => toast.error("Could not verify payment."));
      navigate(location.pathname, { replace: true });
    } else if (payment === "cancelled") {
      toast.info("Payment cancelled.");
      navigate(location.pathname, { replace: true });
    }
  }, [location.search]);

  const handleCvPlanCheckout = async (planId) => {
    setCheckoutPlanId(planId);
    try {
      const session = await paymentService.createCheckoutSession({ plan_id: planId });
      window.location.assign(session.url);
    } catch (err) {
      toast.error(err.message || "Could not start checkout.");
      setCheckoutPlanId(null);
    }
  };

  const refresh = () => {
    cvService.list().then((data) => {
      setCvs(Array.isArray(data?.cvs) ? data.cvs : (Array.isArray(data) ? data : []));
      if (data?.plan) setPlan(data.plan);
      if (data?.limits) setLimits(data.limits);
    }).catch(() => setCvs([])).finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { await cvService.upload(file); toast.success("CV uploaded."); refresh(); }
    catch (err) { toast.error(err.message || "Upload failed."); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handleGenerate = async (cvId) => {
    setGenerating(true);
    try {
      const result = await cvService.generate({ cvId, templateId: selectedTemplate });
      if (result?.url) { window.open(result.url, "_blank"); toast.success("CV generated! Use Print (Ctrl+P) to save as PDF."); }
      else toast.info("CV generated.");
      setTimeout(refresh, 1000);
    } catch (err) { toast.error(err.message || "Could not generate CV."); }
    finally { setGenerating(false); }
  };

  const handleSetDefault = async (id) => { await cvService.setDefault(id); toast.success("Default CV updated."); refresh(); };
  const handleDownload = async (cv) => {
    try { const result = await cvService.download(cv.id); if (result?.url) window.open(result.url, "_blank"); }
    catch { toast.error("Could not download CV."); }
  };
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try { await cvService.remove(deleteConfirm.id); toast.success("CV deleted."); setDeleteConfirm(null); refresh(); }
    catch { toast.error("Could not delete CV."); }
  };

  const canAddMore = cvs.length < limits.maxCVs;
  const planInfo = PLAN_INFO[plan] || PLAN_INFO.free;

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">My CVs</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{cvs.length}/{limits.maxCVs} CVs used</p>
          </div>
          <Badge variant="outline" className={`text-[0.65rem] font-medium ${planInfo.color}`}>
            <Crown className="w-3 h-3 mr-1" /> {planInfo.label}
          </Badge>
        </div>
        <Button onClick={() => fileRef.current?.click()} disabled={uploading || !canAddMore} variant="outline" className="rounded-full px-5 h-9 text-sm font-medium">
          {uploading ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-1.5" />Upload CV</>}
        </Button>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} className="hidden" />
      </div>

      {/* Generator */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/[0.08] flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Generate from Profile</p>
              <p className="text-xs text-muted-foreground">Create a CV from your profile data using a template.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-36 h-9 rounded-lg text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TEMPLATE_INFO).map(([id, tpl]) => {
                  const locked = !limits.templates.includes(id);
                  return <SelectItem key={id} value={id} disabled={locked}>{tpl.label}{locked ? " (Upgrade)" : ""}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            <Button onClick={() => handleGenerate()} disabled={generating || !canAddMore} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg h-9 text-sm font-medium">
              {generating ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Generating</> : <><Wand2 className="w-4 h-4 mr-1.5" />Generate</>}
            </Button>
          </div>
        </div>
        {limits.watermark && (
          <p className="text-[0.65rem] text-amber-600 mt-3 font-medium">Free plan CVs include a watermark. Upgrade to remove it.</p>
        )}
      </div>

      {/* CV list */}
      {cvs.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-muted-foreground/25" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">No CVs yet</h3>
          <p className="text-sm text-muted-foreground">Upload a CV or generate one from your profile.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
          {cvs.map((cv) => (
            <div key={cv.id} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{cv.name}</p>
                    {cv.is_default && <Badge className="text-[0.6rem] h-4 px-1.5">Default</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {cv.type === "uploaded" ? cv.file_name : `Generated · ${TEMPLATE_INFO[cv.template_id]?.label || "Basic"}`}
                    {cv.file_size ? ` · ${(cv.file_size / 1024).toFixed(0)} KB` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!cv.is_default && (
                  <Button variant="ghost" size="sm" className="h-8 text-xs rounded-lg" onClick={() => handleSetDefault(cv.id)}>
                    <Star className="w-3.5 h-3.5 mr-1" /> Default
                  </Button>
                )}
                {cv.type?.startsWith("generated") && (
                  <Button variant="ghost" size="sm" className="h-8 text-xs rounded-lg" onClick={() => handleGenerate(cv.id)} disabled={generating}>
                    <Wand2 className="w-3.5 h-3.5" />
                  </Button>
                )}
                {(cv.file_key || cv.file_path) && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleDownload(cv)}>
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(cv)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade */}
      {plan === "free" && (
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/[0.08] flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-foreground mb-1">Upgrade Your CV Plan</p>
              <p className="text-sm text-muted-foreground mb-4">Premium templates, no watermark, and multiple CVs for different applications.</p>

              {cvPlans.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cvPlans.map((cvPlan, i) => {
                    const isLoading = checkoutPlanId === cvPlan.id;
                    const isRecommended = i === cvPlans.length - 1 && cvPlans.length > 1;
                    return (
                      <div key={cvPlan.id} className={`rounded-xl border bg-card p-5 flex flex-col ${isRecommended ? "border-accent/30" : "border-border/50"}`}>
                        {isRecommended && (
                          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-accent mb-2">Recommended</span>
                        )}
                        <p className="text-base font-display font-bold text-foreground">{cvPlan.name}</p>
                        {cvPlan.description && <p className="text-xs text-muted-foreground mt-1">{cvPlan.description}</p>}
                        <div className="flex items-baseline gap-1 mt-3 mb-4">
                          <span className="text-xl font-display font-bold text-foreground">{formatPlanPrice(cvPlan)}</span>
                          {cvPlan.interval && <span className="text-xs text-muted-foreground">/{cvPlan.interval}</span>}
                        </div>
                        <Button
                          size="sm"
                          className={`w-full rounded-lg h-9 text-xs font-medium mt-auto ${isRecommended ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}`}
                          variant={isRecommended ? "default" : "outline"}
                          onClick={() => handleCvPlanCheckout(cvPlan.id)}
                          disabled={Boolean(checkoutPlanId)}
                        >
                          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <ArrowRight className="w-3.5 h-3.5 mr-1.5" />}
                          {isLoading ? "Redirecting..." : "Upgrade"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/50 bg-card p-5">
                    <p className="text-base font-display font-bold text-foreground">Professional</p>
                    <p className="text-xs text-muted-foreground mt-1">1 CV, 3 templates, no watermark</p>
                    <p className="text-xs text-muted-foreground mt-3">Coming soon</p>
                  </div>
                  <div className="rounded-xl border border-accent/30 bg-card p-5">
                    <span className="text-[0.55rem] font-bold uppercase tracking-wider text-accent">Recommended</span>
                    <p className="text-base font-display font-bold text-foreground mt-1">Premium</p>
                    <p className="text-xs text-muted-foreground mt-1">4 CVs, all templates, no watermark</p>
                    <p className="text-xs text-muted-foreground mt-3">Coming soon</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete CV"
        description={`Delete "${deleteConfirm?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
