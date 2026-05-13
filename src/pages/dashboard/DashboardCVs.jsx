import React, { useEffect, useRef, useState } from "react";
import { useOutletContext, Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { FileText, Upload, Star, Trash2, Download, Wand2, Lock, Palette, Crown, Loader2, ArrowRight, Pencil, Plus, X } from "lucide-react";
import cvService from "@/services/cv";
import paymentService from "@/services/payment";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
    if (!window.confirm("By uploading your CV, you consent to JobsDirect.ie storing and processing your CV data for recruitment purposes in accordance with our Privacy Policy and GDPR regulations.")) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
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

  const [editingCV, setEditingCV] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const openEditCV = (cv) => {
    setEditForm({
      title: cv.title || "",
      bio: cv.bio || "",
      skills: cv.skills || "",
      work_experience: Array.isArray(cv.work_experience) ? cv.work_experience : [],
      education: Array.isArray(cv.education) ? cv.education : [],
    });
    setEditingCV(cv);
  };

  const saveEditCV = async () => {
    setSavingEdit(true);
    try {
      await cvService.updateContent(editingCV.id, editForm);
      toast.success("CV content updated.");
      setEditingCV(null);
      refresh();
    } catch (err) { toast.error(err.message || "Failed to save."); }
    finally { setSavingEdit(false); }
  };

  const addWorkExp = () => setEditForm(f => ({ ...f, work_experience: [...f.work_experience, { job_title: "", company: "", location: "", start_date: "", end_date: "", current: false, responsibilities: "" }] }));
  const removeWorkExp = (i) => setEditForm(f => ({ ...f, work_experience: f.work_experience.filter((_, idx) => idx !== i) }));
  const updateWorkExp = (i, key, val) => setEditForm(f => { const u = [...f.work_experience]; u[i] = { ...u[i], [key]: val }; return { ...f, work_experience: u }; });

  const addEdu = () => setEditForm(f => ({ ...f, education: [...f.education, { degree: "", institution: "", field_of_study: "", start_date: "", end_date: "" }] }));
  const removeEdu = (i) => setEditForm(f => ({ ...f, education: f.education.filter((_, idx) => idx !== i) }));
  const updateEdu = (i, key, val) => setEditForm(f => { const u = [...f.education]; u[i] = { ...u[i], [key]: val }; return { ...f, education: u }; });

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
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEditCV(cv)} title="Edit CV content">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
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
      {plan !== "premium" && (() => {
        // Filter plans: show only plans above current tier
        const tierOrder = ["free", "professional", "premium"];
        const currentTier = tierOrder.indexOf(plan);
        const availablePlans = cvPlans.filter((p) => {
          const planTier = tierOrder.indexOf(p.cv_plan_tier || p.id?.replace("cv_", ""));
          return planTier > currentTier;
        });
        if (!availablePlans.length && !cvPlans.length) return null;
        const plansToShow = availablePlans.length ? availablePlans : cvPlans;

        return (
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/[0.08] flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-foreground mb-1">
                {plan === "free" ? "Upgrade Your CV Plan" : "Upgrade to Premium"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {plan === "free"
                  ? "Premium templates, no watermark, and multiple CVs for different applications."
                  : "Get up to 4 CVs with all templates for different job types."}
              </p>

              {plansToShow.length > 0 ? (
                <div className={`grid grid-cols-1 ${plansToShow.length > 1 ? "sm:grid-cols-2" : ""} gap-3`}>
                  {plansToShow.map((cvPlan, i) => {
                    const isLoading = checkoutPlanId === cvPlan.id;
                    const isRecommended = i === plansToShow.length - 1 && plansToShow.length > 1;
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
                          className={`w-full rounded-lg h-9 text-xs font-medium mt-auto ${isRecommended || plansToShow.length === 1 ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}`}
                          variant={isRecommended || plansToShow.length === 1 ? "default" : "outline"}
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
        );
      })()}

      {/* Edit CV Content Dialog */}
      <Dialog open={!!editingCV} onOpenChange={(v) => !v && setEditingCV(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Edit CV — {editingCV?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Title & Bio */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Professional Title</Label>
                <Input value={editForm.title || ""} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="e.g. Senior Frontend Developer" className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">Professional Summary</Label>
                <textarea value={editForm.bio || ""} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Brief overview of your experience and goals..." className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">Skills</Label>
              <Input value={editForm.skills || ""} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} placeholder="React, TypeScript, Node.js, PostgreSQL..." className="h-9" />
              <p className="text-xs text-muted-foreground">Comma-separated list</p>
            </div>

            {/* Work Experience */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Work Experience</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs rounded-lg" onClick={addWorkExp}><Plus className="w-3 h-3 mr-1" />Add</Button>
              </div>
              {(editForm.work_experience || []).map((exp, i) => (
                <div key={i} className="rounded-lg border border-border/50 p-3 space-y-2 relative">
                  <button type="button" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeWorkExp(i)}><X className="w-3.5 h-3.5" /></button>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={exp.job_title || ""} onChange={(e) => updateWorkExp(i, "job_title", e.target.value)} placeholder="Job Title" className="h-8 text-sm" />
                    <Input value={exp.company || ""} onChange={(e) => updateWorkExp(i, "company", e.target.value)} placeholder="Company" className="h-8 text-sm" />
                    <Input value={exp.location || ""} onChange={(e) => updateWorkExp(i, "location", e.target.value)} placeholder="Location" className="h-8 text-sm" />
                    <div className="grid grid-cols-2 gap-1">
                      <Input type="date" value={exp.start_date || ""} onChange={(e) => updateWorkExp(i, "start_date", e.target.value)} className="h-8 text-xs" />
                      <Input type="date" value={exp.end_date || ""} onChange={(e) => updateWorkExp(i, "end_date", e.target.value)} className="h-8 text-xs" disabled={exp.current} />
                    </div>
                  </div>
                  <textarea value={exp.responsibilities || ""} onChange={(e) => updateWorkExp(i, "responsibilities", e.target.value)} placeholder="Key responsibilities..." className="w-full min-h-[50px] px-2 py-1.5 rounded border border-input bg-background text-xs resize-none" />
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Education</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs rounded-lg" onClick={addEdu}><Plus className="w-3 h-3 mr-1" />Add</Button>
              </div>
              {(editForm.education || []).map((edu, i) => (
                <div key={i} className="rounded-lg border border-border/50 p-3 space-y-2 relative">
                  <button type="button" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeEdu(i)}><X className="w-3.5 h-3.5" /></button>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={edu.degree || ""} onChange={(e) => updateEdu(i, "degree", e.target.value)} placeholder="Degree / Qualification" className="h-8 text-sm" />
                    <Input value={edu.institution || ""} onChange={(e) => updateEdu(i, "institution", e.target.value)} placeholder="Institution" className="h-8 text-sm" />
                    <Input value={edu.field_of_study || ""} onChange={(e) => updateEdu(i, "field_of_study", e.target.value)} placeholder="Field of Study" className="h-8 text-sm" />
                    <div className="grid grid-cols-2 gap-1">
                      <Input type="date" value={edu.start_date || ""} onChange={(e) => updateEdu(i, "start_date", e.target.value)} className="h-8 text-xs" />
                      <Input type="date" value={edu.end_date || ""} onChange={(e) => updateEdu(i, "end_date", e.target.value)} className="h-8 text-xs" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCV(null)}>Cancel</Button>
            <Button onClick={saveEditCV} disabled={savingEdit} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {savingEdit ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" />Saving...</> : "Save CV Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
