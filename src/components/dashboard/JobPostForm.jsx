import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import jobService from "@/services/job";
import paymentService from "@/services/payment";
import productService from "@/services/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useProducts } from "@/hooks/useProducts";
import FormFieldRenderer from "@/components/forms/FormFieldRenderer";
import {
  JOB_FIELD_GROUPS,
  JOB_FIELDS,
  JOB_FORM_DEFAULTS,
  buildEntityFormValues,
  hasFieldValue,
} from "@/lib/siteSettings";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, Send, X } from "lucide-react";
import JobPaymentModal from "./JobPaymentModal";

const EMPLOYER_JOB_FIELDS = JOB_FIELDS.filter((field) => !field.adminOnly && field.manageInEmployerForm !== false);

function createInitialForm(initialJob) {
  return buildEntityFormValues(JOB_FORM_DEFAULTS, EMPLOYER_JOB_FIELDS, initialJob);
}

function formatCredits(n) {
  return `${n} credit${n !== 1 ? "s" : ""}`;
}

export default function JobPostForm({ employer, user, initialJob = null, autoFocusTitle = false, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const { settings: publicSettings } = useSiteSettings();
  const { addons: addonProducts, listing: listingProduct } = useProducts();
  const approvalRequired = publicSettings.job_approval_required !== false;
  const titleInputRef = useRef(null);

  // Form state
  const [form, setForm] = useState(() => createInitialForm(initialJob));
  const [submitting, setSubmitting] = useState(false);
  const jobFormConfig = publicSettings.employer_job_form_config || {};

  // Input method: null (not chosen), "manual", or "import"
  const [inputMethod, setInputMethod] = useState(initialJob ? "manual" : null);
  const [jobRef, setJobRef] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scraped, setScraped] = useState(false);

  const [balance, setBalance] = useState(null);

  const isEditing = Boolean(initialJob?.id);
  const creditBalance = employer.credits || 0;

  // Load balance on mount
  useEffect(() => {
    paymentService.getBalance(employer?.id).then(setBalance).catch(() => { });
  }, [employer?.id]);

  const canPostFree = balance?.can_post_free && !isEditing && inputMethod !== "import";





  const [showPaymentModal, setShowPaymentModal] = useState(false);



  // Reset form on initial job change
  useEffect(() => {
    setForm(createInitialForm(initialJob));
    setJobRef("");
    setScraped(false);
  }, [initialJob]);

  useEffect(() => {
    if (!autoFocusTitle || !titleInputRef.current) return;
    const timer = setTimeout(() => { titleInputRef.current?.focus(); }, 200);
    return () => clearTimeout(timer);
  }, [autoFocusTitle, initialJob]);

  const visibleGroups = useMemo(
    () =>
      JOB_FIELD_GROUPS.map((group) => ({
        ...group,
        fields: group.fields.filter((field) => {
          if (field.adminOnly || field.manageInEmployerForm === false) return false;
          if (jobFormConfig?.[field.key]?.visible === false) return false;
          return true;
        }),
      })).filter((group) => group.fields.length),
    [jobFormConfig],
  );

  const update = (field, value) => setForm((c) => ({ ...c, [field]: value }));

  const validateVisibleRequiredFields = () => {
    for (const group of visibleGroups) {
      for (const field of group.fields) {
        const control = jobFormConfig?.[field.key];
        if (control?.required && !hasFieldValue(field, form[field.key])) {
          toast.error(`Missing required field — ${field.label} is required before submitting this job.`);
          return false;
        }
      }
    }
    return true;
  };



  const [scanning, setScanning] = useState(false);
  const [moderationIssues, setModerationIssues] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateVisibleRequiredFields()) return;

    // AI content scan before proceeding
    setScanning(true);
    setModerationIssues(null);
    try {
      const result = await jobService.scanContent(form.title, form.description, initialJob?.id);
      if (!result.approved && result.issues?.length > 0) {
        if (result.severity === "critical" && initialJob?.id) {
          // Critical on existing job = instant flag, admin notified, form closes
          toast.error("This listing has been flagged for serious compliance violations. An admin has been notified.");
          setScanning(false);
          queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
          onClose?.();
          return;
        }
        // New job OR warning/violation = show inline, let them fix
        setModerationIssues(result.issues);
        setScanning(false);
        return;
      }
    } catch {
      // If scan fails, proceed anyway — backend will catch it
    }
    setScanning(false);

    if (isEditing) {
      executeSubmit();
      return;
    }

    setShowPaymentModal(true);
  };

  const executeSubmit = async (selections = null) => {
    setShowPaymentModal(false);
    setSubmitting(true);
    try {
      // Use selections from modal if provided (for new jobs)
      const currentListingType = selections ? selections.listingType : "paid";
      const currentAddons = selections ? selections.selectedAddons : [];
      const currentTotalCost = selections ? selections.totalCost : 0;

      const addonIds = [...currentAddons];

      const payload = {
        ...form,
        salary_min: form.salary_min === "" ? undefined : Number(form.salary_min),
        salary_max: form.salary_max === "" ? undefined : Number(form.salary_max),
        hours_per_week: form.hours_per_week === "" ? undefined : Number(form.hours_per_week),
        positions_count: form.positions_count === "" ? undefined : Number(form.positions_count),
        company_name: employer.company_name,
        employer_id: employer.id,
        status: initialJob?.status || (approvalRequired ? "pending_review" : "approved"),
        source: inputMethod === "import" && scraped ? "jobsireland" : (initialJob?.source || "manual"),
        addons: addonIds,
      };

      if (!isEditing) {
        payload.listing_type = currentListingType;
        payload.is_imported = Boolean(inputMethod === "import" && scraped);
      }

      if (isEditing) {
        await jobService.update(initialJob.id, payload);
      } else {
        const result = await jobService.create(payload);
        if (result.needs_checkout && result.checkout_url) {
          toast.info("Redirecting to payment...");
          window.location.assign(result.checkout_url);
          return;
        }
      }

      paymentService.getBalance(employer?.id).then(setBalance).catch(() => { });

      toast.success(
        isEditing
          ? "Job Updated — Your job listing has been updated."
          : currentListingType === "free"
            ? "Job Submitted — Your free 14-day listing has been submitted for review."
            : `Job Submitted — Your 30-day listing has been submitted. ${formatCredits(currentTotalCost)} deducted.`
      );
      onSuccess();
    } catch (error) {
      toast.error(`Could not save — ${error.message || "Please check the details and try again."}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScrape = async () => {
    if (!/^\d{7}$/.test(jobRef)) {
      toast.error("Invalid Reference — Please enter a valid 7-digit Job Reference Number.");
      return;
    }
    setScraping(true);
    try {
      const result = await jobService.scrapeJobsIreland({ ref: jobRef });
      const data = result.data || result;
      setForm((current) => ({
        ...current,
        title: data.title || current.title,
        description: data.description || current.description,
        short_description: data.short_description || current.short_description,
        company_name: data.company_name || current.company_name,
        location: data.location || current.location,
        location_full: data.location_full || current.location_full,
        job_type: data.job_type || current.job_type,
        career_level: data.career_level || current.career_level,
        sector: data.sector || current.sector,
        category: data.category || current.category,
        country: data.country || current.country,
        salary_min: data.salary_min ?? current.salary_min,
        salary_max: data.salary_max ?? current.salary_max,
        salary_period: data.salary_period || current.salary_period,
        hours_per_week: data.hours_per_week ?? current.hours_per_week,
        positions_count: data.positions_count ?? current.positions_count,
        source_url: data.source_url || current.source_url,
        jobsireland_ref: data.jobsireland_ref || current.jobsireland_ref,
      }));
      setScraped(true);
      toast.success("Job details imported! Review and edit before submitting.");
    } catch (error) {
      toast.error(`Import failed — ${error.message || "Could not fetch job from JobsIreland.ie"}`);
    } finally {
      setScraping(false);
    }
  };

  const handleAddonToggle = (addonId, checked) => {
    setSelectedAddons((prev) =>
      checked ? [...prev, addonId] : prev.filter((id) => id !== addonId),
    );
  };

  const showForm = isEditing || inputMethod === "manual" || (inputMethod === "import" && scraped);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">{isEditing ? "Edit Job" : "Post a New Job"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ─── Step 1: Choose input method ─── */}
          {!isEditing && !inputMethod && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-4">
              <h3 className="text-sm font-semibold">How would you like to create this job?</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 hover:border-primary p-4 text-left transition hover:shadow-sm"
                  onClick={() => setInputMethod("manual")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Create Manually</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Fill in all job details yourself</p>
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 hover:border-accent p-4 text-left transition hover:shadow-sm"
                  onClick={() => setInputMethod("import")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-accent" />
                    <span className="text-sm font-semibold">Import from JobsIreland</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Auto-fill from a JobsIreland.ie listing</p>
                  <p className="text-xs font-semibold text-accent mt-1">Listing + import add-on (always paid)</p>
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 2: Import UI ─── */}
          {!isEditing && inputMethod === "import" && !scraped && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-accent" />
                  Import from JobsIreland.ie
                </h3>
                <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => { setInputMethod("manual"); setScraped(false); setJobRef(""); }}>
                  Switch to manual
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="jobRef" className="text-xs">Job Reference Number (7 digits)</Label>
                    <Input
                      id="jobRef"
                      value={jobRef}
                      onChange={(e) => { setJobRef(e.target.value.replace(/\D/g, "").slice(0, 7)); setScraped(false); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (!scraping && jobRef.length === 7) handleScrape();
                        }
                      }}
                      placeholder="e.g. 1234567"
                      maxLength={7}
                    />
                  </div>
                  <Button type="button" onClick={handleScrape} disabled={scraping || jobRef.length !== 7} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {scraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                    {scraping ? "Importing..." : "Import"}
                  </Button>
                </div>
                {jobRef.length === 7 && (
                  <a href={`https://jobsireland.ie/en-US/job-Details?id=${jobRef}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent underline">
                    <ExternalLink className="h-3 w-3" /> Preview on JobsIreland.ie
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ─── Import success ─── */}
          {inputMethod === "import" && scraped && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Fields pre-filled from JobsIreland. Review and edit below.
            </div>
          )}



          {/* ─── Job Form Fields ─── */}
          {showForm && (
            <>
              {!visibleGroups.length && (
                <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                  All employer job fields are currently hidden. Enable them from Admin Settings.
                </div>
              )}

              {visibleGroups.map((group) => (
                <section key={group.id} className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">{group.title}</h3>
                    {group.description && <p className="text-xs text-muted-foreground">{group.description}</p>}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {group.fields.map((field) => {
                      if (field.showWhen && form[field.showWhen.field] !== field.showWhen.value) return null;
                      return (<FormFieldRenderer
                        key={field.key}
                        field={field}
                        value={form[field.key]}
                        onChange={(value) => update(field.key, value)}
                        required={Boolean(jobFormConfig?.[field.key]?.required)}
                        inputRef={field.key === "title" ? titleInputRef : undefined}
                      />);
                    })}
                  </div>
                </section>
              ))}

              {/* ─── Moderation Issues ─── */}
              {moderationIssues && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
                  <p className="text-sm font-semibold text-red-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Your listing contains language that may not comply with Irish employment equality law. Please revise:
                  </p>
                  {moderationIssues.map((issue, idx) => (
                    <div key={idx} className="text-sm text-red-700 pl-5">
                      <span className="font-medium">"{issue.text}"</span>
                      <span className="text-red-600"> — {issue.reason}</span>
                    </div>
                  ))}
                  <p className="text-xs text-red-600 pl-5">Update the flagged text above and submit again.</p>
                </div>
              )}

              {/* ─── Submit ─── */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={submitting || scanning}>
                  {scanning ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking compliance...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" />
                    {submitting
                      ? (isEditing ? "Saving..." : "Submitting...")
                      : isEditing
                        ? "Save Changes"
                        : "Submit Job"
                    }</>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>

      <JobPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        employer={employer}
        inputMethod={inputMethod}
        onConfirm={executeSubmit}
        submitting={submitting}
      />

    </Card>
  );
}
