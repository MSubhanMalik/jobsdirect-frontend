import React, { useEffect, useMemo, useRef, useState } from "react";
import { digify } from "@/api/digifyClient";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";
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

function formatCents(cents) {
  return `€${(cents / 100).toFixed(2)}`;
}

export default function JobPostForm({ employer, user, initialJob = null, autoFocusTitle = false, onClose, onSuccess }) {
  const { toast } = useToast();
  const { appPublicSettings } = useAuth();
  const publicSettings = appPublicSettings?.public_settings || {};
  const approvalRequired = publicSettings.job_approval_required !== false;
  const titleInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [copyFromJobsIreland, setCopyFromJobsIreland] = useState(false);
  const [jobRef, setJobRef] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scraped, setScraped] = useState(false);
  const [form, setForm] = useState(() => createInitialForm(initialJob));
  const jobFormConfig = publicSettings.employer_job_form_config || {};

  // Pricing state
  const [listingType, setListingType] = useState(initialJob ? "paid" : "free");
  const [addons, setAddons] = useState({
    isFeatured: Boolean(initialJob?.is_featured),
    isHighlighted: Boolean(initialJob?.is_highlighted),
  });
  const [balance, setBalance] = useState(null);
  const [pricing, setPricing] = useState(null);

  const isEditing = Boolean(initialJob?.id);

  // Load balance and pricing
  useEffect(() => {
    digify.payments.getBalance(employer?.id).then(setBalance).catch(() => {});
    digify.payments.getPricing().then(setPricing).catch(() => {});
  }, [employer?.id]);

  const canPostFree = balance?.canPostFree && !isEditing;

  // Calculate cost
  const costCents = useMemo(() => {
    if (isEditing) return 0; // edits are free
    if (listingType === "free") return 0;
    if (!pricing) return 0;

    let cost = pricing.JOB_28_DAY;
    if (copyFromJobsIreland && scraped) cost = pricing.IMPORT_JOB;
    if (addons.isFeatured) cost += pricing.ADDON_FEATURED;
    if (addons.isHighlighted) cost += pricing.ADDON_HIGHLIGHTED;
    return cost;
  }, [listingType, addons, copyFromJobsIreland, scraped, pricing, isEditing]);

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
          toast({
            title: "Missing required field",
            description: `${field.label} is required before submitting this job.`,
            variant: "destructive",
          });
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
        source: copyFromJobsIreland && scraped ? "jobsireland" : (initialJob?.source || "manual"),
        is_featured: addons.isFeatured,
        is_highlighted: addons.isHighlighted,
      };

      if (!isEditing) {
        payload.listing_type = listingType;
        payload.is_imported = Boolean(copyFromJobsIreland && scraped);
      }

      if (isEditing) {
        await digify.entities.Job.update(initialJob.id, payload);
      } else {
        await digify.entities.Job.create(payload);
      }

      // Refresh balance
      digify.payments.getBalance(employer?.id).then(setBalance).catch(() => {});

      toast({
        title: isEditing ? "Job Updated" : "Job Submitted",
        description: isEditing
          ? "Your job listing has been updated."
          : listingType === "free"
            ? "Your free 14-day listing has been submitted for review."
            : `Your 28-day listing has been submitted. ${formatCents(costCents)} deducted from credits.`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Could not save",
        description: error.message || "Please check the details and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleScrape = async () => {
    if (!/^\d{7}$/.test(jobRef)) {
      toast({
        title: "Invalid Reference",
        description: "Please enter a valid 7-digit Job Reference Number.",
        variant: "destructive",
      });
      return;
    }

    setScraping(true);
    try {
      const response = await digify.functions.invoke("scrapeJobsIreland", { ref: jobRef });
      const data = response.data?.data?.response || response.data?.data || {};
      setForm((current) => ({
        ...current,
        title: data.title || current.title,
        description: data.description || current.description,
        short_description: data.short_description || current.short_description,
        location: data.location || current.location,
        job_type: data.job_type || current.job_type,
        category: data.category || current.category,
        country: data.country || current.country,
        hours_per_week: data.hours_per_week ?? current.hours_per_week,
        positions_count: data.positions_count ?? current.positions_count,
        salary_min: data.salary_min ?? current.salary_min,
        salary_max: data.salary_max ?? current.salary_max,
        salary_period: data.salary_period || current.salary_period,
        career_level: data.career_level || current.career_level,
        application_method: data.application_method || current.application_method,
        application_email: data.application_email || current.application_email,
        application_url: data.application_url || current.application_url,
      }));
      setScraped(true);
      setListingType("paid"); // Imported jobs are always paid
      toast({
        title: "Job Details Imported!",
        description: "Fields have been pre-filled. Please review and edit before submitting.",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error.message || "Could not fetch job from JobsIreland.ie",
        variant: "destructive",
      });
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

          {/* ─── Pricing Section (only for new jobs) ─── */}
          {!isEditing && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Listing Type
                </h3>
                {balance && (
                  <span className="text-xs font-medium text-muted-foreground">
                    Balance: <span className="font-bold text-foreground">{balance.creditsDisplay}</span>
                  </span>
                )}
              </div>

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
                  <p className="text-xs text-muted-foreground">28 days, from {pricing ? formatCents(pricing.JOB_28_DAY) : "€15.00"}</p>
                </button>
              </div>

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
                      <span className="text-xs text-muted-foreground">Shown in featured carousel on homepage</span>
                    </div>
                    <span className="text-xs font-semibold">{pricing ? formatCents(pricing.ADDON_FEATURED) : "€5.00"}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={addons.isHighlighted}
                      onCheckedChange={(v) => setAddons((a) => ({ ...a, isHighlighted: Boolean(v) }))}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-blue-500" /> Highlighted
                      </span>
                      <span className="text-xs text-muted-foreground">Stands out with highlight in search results</span>
                    </div>
                    <span className="text-xs font-semibold">{pricing ? formatCents(pricing.ADDON_HIGHLIGHTED) : "€5.00"}</span>
                  </label>
                </div>
              )}

              {/* Cost summary */}
              {listingType === "paid" && costCents > 0 && (
                <div className="flex items-center justify-between rounded-md bg-white border border-slate-200 px-3 py-2">
                  <span className="text-sm font-medium">Total cost</span>
                  <span className="text-base font-bold">{formatCents(costCents)}</span>
                </div>
              )}
            </div>
          )}

          {/* ─── Import from JobsIreland ─── */}
          {!isEditing && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="copyJobsIreland"
                  checked={copyFromJobsIreland}
                  onCheckedChange={(value) => {
                    setCopyFromJobsIreland(Boolean(value));
                    setScraped(false);
                    if (value) setListingType("paid");
                  }}
                />
                <label htmlFor="copyJobsIreland" className="flex cursor-pointer flex-col">
                  <span className="text-sm font-semibold">Copy Job from JobsIreland.ie</span>
                  <span className="text-xs text-muted-foreground">
                    Import job details automatically ({pricing ? formatCents(pricing.IMPORT_JOB) : "€5.00"})
                  </span>
                </label>
              </div>

              {copyFromJobsIreland ? (
                <div className="space-y-3 pt-1">
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

                  {jobRef.length === 7 ? (
                    <a
                      href={`https://jobsireland.ie/en-US/job-Details?id=${jobRef}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-accent underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Preview on JobsIreland.ie
                    </a>
                  ) : null}

                  {scraped ? (
                    <p className="flex items-center gap-1 text-xs font-medium text-accent">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Fields pre-filled - review and edit below before submitting.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}

          {/* ─── Job Form Fields ─── */}
          {!visibleGroups.length ? (
            <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
              All employer job fields are currently hidden. Enable them from Super Admin Site CMS.
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
                    : `Submit & Pay ${formatCents(costCents)}`
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
