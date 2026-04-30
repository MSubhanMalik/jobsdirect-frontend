import React, { useEffect, useMemo, useRef, useState } from "react";
import jobService from "@/services/job";
import paymentService from "@/services/payment";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import FormFieldRenderer from "@/components/forms/FormFieldRenderer";
import {
  JOB_FIELD_GROUPS,
  JOB_FIELDS,
  JOB_FORM_DEFAULTS,
  buildEntityFormValues,
  hasFieldValue,
} from "@/lib/siteSettings";
import { CheckCircle2, CreditCard, ExternalLink, Gift, Loader2, Send, Sparkles, Star, X, Zap } from "lucide-react";

const EMPLOYER_JOB_FIELDS = JOB_FIELDS.filter((field) => !field.adminOnly && field.manageInEmployerForm !== false);

function createInitialForm(initialJob) {
  return buildEntityFormValues(JOB_FORM_DEFAULTS, EMPLOYER_JOB_FIELDS, initialJob);
}

function formatCredits(credits) {
  return `${credits} credit${credits !== 1 ? "s" : ""}`;
}

export default function JobPostForm({ employer, user, initialJob = null, autoFocusTitle = false, onClose, onSuccess }) {
  const { settings: publicSettings } = useSiteSettings();
  const approvalRequired = publicSettings.job_approval_required !== false;
  const [creditCosts, setCreditCosts] = useState({});
  const titleInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [copyFromJobsIreland, setCopyFromJobsIreland] = useState(false);
  const [jobRef, setJobRef] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scraped, setScraped] = useState(false);
  const [form, setForm] = useState(() => createInitialForm(initialJob));
  const jobFormConfig = publicSettings.employer_job_form_config || {};

  // State
  const [inputMethod, setInputMethod] = useState(initialJob ? "manual" : null); // null = not chosen yet
  const [listingType, setListingType] = useState(initialJob ? "paid" : "free");
  const [addons, setAddons] = useState({
    isFeatured: Boolean(initialJob?.is_featured),
    isHighlighted: Boolean(initialJob?.is_highlighted),
  });
  const [balance, setBalance] = useState(null);

  const isEditing = Boolean(initialJob?.id);

  // Load balance + credit costs from backend (single source of truth)
  useEffect(() => {
    paymentService.getBalance(employer?.id).then((b) => {
      setBalance(b);
      if (b?.creditCosts) setCreditCosts(b.creditCosts);
    }).catch(() => {});
  }, [employer?.id]);

  const canPostFree = balance?.canPostFree && !isEditing && inputMethod !== "import";
  const creditBalance = employer.credits || 0;

  // Import from JobsIreland is always paid
  useEffect(() => {
    if (inputMethod === "import") setListingType("paid");
  }, [inputMethod]);

  // Calculate display cost using server-provided creditCosts (backend recalculates on submit)
  const creditCost = useMemo(() => {
    if (isEditing || listingType === "free") return 0;
    let cost = creditCosts.JOB_LISTING || 0;
    if (inputMethod === "import") cost += creditCosts.IMPORT_JOB || 0;
    if (addons.isFeatured) cost += creditCosts.ADDON_FEATURED || 0;
    if (addons.isHighlighted) cost += creditCosts.ADDON_HIGHLIGHT || 0;
    return cost;
  }, [listingType, addons, inputMethod, isEditing, creditCosts]);

  useEffect(() => {
    setForm(createInitialForm(initialJob));
    setCopyFromJobsIreland(false);
    setJobRef("");
    setScraped(false);
  }, [initialJob]);

  useEffect(() => {
    if (!autoFocusTitle || !titleInputRef.current) return;
    const focusTimer = setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select?.();
    }, 200);
    return () => clearTimeout(focusTimer);
  }, [autoFocusTitle, initialJob]);

  const visibleGroups = useMemo(
    () =>
      JOB_FIELD_GROUPS.map((group) => ({
        ...group,
        fields: group.fields.filter((field) => {
          if (field.adminOnly || field.manageInEmployerForm === false) return false;
          return jobFormConfig?.[field.key]?.visible !== false;
        }),
      })).filter((group) => group.fields.length),
    [jobFormConfig],
  );

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateVisibleRequiredFields()) return;

    setSubmitting(true);
    try {
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
        is_featured: addons.isFeatured,
        is_highlighted: addons.isHighlighted,
      };

      if (!isEditing) {
        payload.listing_type = listingType;
        payload.is_imported = Boolean(inputMethod === "import" && scraped);
      }

      if (isEditing) {
        await jobService.update(initialJob.id, payload);
      } else {
        const result = await jobService.create(payload);

        // If backend returned a checkout URL, redirect to Stripe
        if (result.needsCheckout && result.checkoutUrl) {
          toast.info("Redirecting to payment...");
          window.location.assign(result.checkoutUrl);
          return;
        }
      }

      // Refresh balance
      paymentService.getBalance(employer?.id).then(setBalance).catch(() => {});

      toast.success(
        isEditing
          ? "Job Updated — Your job listing has been updated."
          : listingType === "free"
            ? "Job Submitted — Your free 14-day listing has been submitted for review."
            : `Job Submitted — Your 30-day listing has been submitted. ${formatCredits(creditCost)} deducted.`
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
      const scraped = result.data || result;
      setForm((current) => ({
        ...current,
        title: scraped.title || current.title,
        description: scraped.description || current.description,
        short_description: scraped.short_description || current.short_description,
        location: scraped.location || current.location,
        job_type: scraped.job_type || current.job_type,
        category: scraped.category || current.category,
        country: scraped.country || current.country,
        hours_per_week: scraped.hours_per_week ?? current.hours_per_week,
        positions_count: scraped.positions_count ?? current.positions_count,
        salary_min: scraped.salary_min ?? current.salary_min,
        salary_max: scraped.salary_max ?? current.salary_max,
        salary_period: scraped.salary_period || current.salary_period,
        career_level: scraped.career_level || current.career_level,
        application_method: scraped.application_method || current.application_method,
        application_email: scraped.application_email || current.application_email,
        application_url: scraped.application_url || current.application_url,
      }));
      setScraped(true);
      setListingType("paid"); // Imported jobs are always paid
      toast.success("Job Details Imported! Fields have been pre-filled. Please review and edit before submitting.");
    } catch (error) {
      toast.error(`Import Failed — ${error.message || "Could not fetch job from JobsIreland.ie"}`);
    } finally {
      setScraping(false);
    }
  };

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

          {/* ─── Step 1: Choose input method (only for new jobs) ─── */}
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
                  <p className="text-xs font-semibold text-accent mt-1">{formatCredits((creditCosts.JOB_LISTING || 0) + (creditCosts.IMPORT_JOB || 0))} (listing + import)</p>
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 2: Import from JobsIreland (if chosen) ─── */}
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
                      onChange={(event) => {
                        setJobRef(event.target.value.replace(/\D/g, "").slice(0, 7));
                        setScraped(false);
                      }}
                      placeholder="e.g. 1234567"
                      maxLength={7}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleScrape}
                    disabled={scraping || jobRef.length !== 7}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
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

          {/* ─── Imported success ─── */}
          {inputMethod === "import" && scraped && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Fields pre-filled from JobsIreland. Review and edit below before submitting.
            </div>
          )}

          {/* ─── Pricing Section (after method chosen, only for new jobs) ─── */}
          {!isEditing && (inputMethod === "manual" || (inputMethod === "import" && scraped)) && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Listing Type
                </h3>
                <span className="text-xs font-medium text-muted-foreground">
                  Balance: <span className="font-bold text-foreground">{creditBalance} credits</span>
                </span>
              </div>

              {inputMethod === "import" ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="text-sm font-medium text-amber-800">Imported listings are always paid (30 days, {formatCredits((creditCosts.JOB_LISTING || 0) + (creditCosts.IMPORT_JOB || 0))} — listing + import fee)</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`rounded-lg border p-3 text-left transition ${
                      listingType === "free"
                        ? "border-emerald-600 bg-emerald-50 shadow-[0_0_0_1px_theme(colors.emerald.600)]"
                        : "border-slate-200 hover:border-slate-300"
                    } ${!canPostFree ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => canPostFree && setListingType("free")}
                    disabled={!canPostFree}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold">Free Listing</span>
                    </div>
                    <p className="text-xs text-muted-foreground">14 days, 1 per month</p>
                    {!canPostFree && <p className="text-xs text-amber-600 mt-1">Used this month</p>}
                  </button>
                  <button
                    type="button"
                    className={`rounded-lg border p-3 text-left transition ${
                      listingType === "paid"
                        ? "border-emerald-600 bg-emerald-50 shadow-[0_0_0_1px_theme(colors.emerald.600)]"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => setListingType("paid")}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-semibold">Paid Listing</span>
                    </div>
                    <p className="text-xs text-muted-foreground">30 days, {formatCredits(creditCosts.JOB_LISTING)} (or pay via checkout)</p>
                  </button>
                </div>
              )}

              {/* Add-ons (only for paid) */}
              {listingType === "paid" && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Add-ons</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={addons.isFeatured}
                      onCheckedChange={(v) => setAddons((a) => ({ ...a, isFeatured: Boolean(v) }))}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500" /> Featured
                      </span>
                      <span className="text-xs text-muted-foreground">Show in featured carousel on homepage</span>
                    </div>
                    <span className="text-xs font-semibold">{formatCredits(creditCosts.ADDON_FEATURED)}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={addons.isHighlighted}
                      onCheckedChange={(v) => setAddons((a) => ({ ...a, isHighlighted: Boolean(v) }))}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-blue-500" /> Highlight
                      </span>
                      <span className="text-xs text-muted-foreground">Stand out in search results with visual highlight</span>
                    </div>
                    <span className="text-xs font-semibold">{formatCredits(creditCosts.ADDON_HIGHLIGHT)}</span>
                  </label>
                </div>
              )}

              {/* Cost summary */}
              {listingType === "paid" && creditCost > 0 && (
                <div className="rounded-md bg-white border border-slate-200 px-3 py-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total cost</span>
                    <span className="text-base font-bold">{formatCredits(creditCost)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {creditBalance >= creditCost
                      ? `Will be deducted from your credits (${creditBalance} available)`
                      : `Insufficient credits (${creditBalance} available). You'll be redirected to Stripe checkout.`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── Job Form Fields (show when ready) ─── */}
          {(isEditing || inputMethod === "manual" || (inputMethod === "import" && scraped)) && (
            <>
              {!visibleGroups.length ? (
                <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                  All employer job fields are currently hidden. Enable them from Admin Site CMS.
                </div>
              ) : null}

              {visibleGroups.map((group) => (
                <section key={group.id} className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">{group.title}</h3>
                    {group.description ? <p className="text-xs text-muted-foreground">{group.description}</p> : null}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {group.fields.map((field) => (
                      <FormFieldRenderer
                        key={field.key}
                        field={field}
                        value={form[field.key]}
                        onChange={(value) => update(field.key, value)}
                        required={Boolean(jobFormConfig?.[field.key]?.required)}
                        inputRef={field.key === "title" ? titleInputRef : undefined}
                      />
                    ))}
                  </div>
                </section>
              ))}

              {/* ─── Submit ─── */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={submitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {submitting
                    ? (isEditing ? "Saving..." : "Submitting...")
                    : isEditing
                      ? "Save Changes"
                      : listingType === "free"
                        ? "Submit Free Listing"
                        : creditBalance >= creditCost
                          ? `Submit (${formatCredits(creditCost)})`
                          : `Submit & Pay €10`
                  }
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
