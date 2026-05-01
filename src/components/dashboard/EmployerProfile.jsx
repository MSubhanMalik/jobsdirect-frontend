import React, { useEffect, useMemo, useState } from "react";
import employerService from "@/services/employer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { getAdultDateMax, isAtLeast18 } from "@/lib/age";
import FormFieldRenderer from "@/components/forms/FormFieldRenderer";
import {
  COMPANY_FIELD_GROUPS,
  COMPANY_FIELDS,
  EMPLOYER_FORM_DEFAULTS,
  buildEntityFormValues,
  hasFieldValue,
} from "@/lib/siteSettings";
import { useQuery } from "@tanstack/react-query";
import teamService from "@/services/team";
import { useAuthStore } from "@/stores/authStore";
import { Save, ShieldCheck, ShieldAlert, FileUp, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EMPLOYER_VISIBLE_FIELDS = COMPANY_FIELDS.filter((field) => !field.adminOnly && field.manageInEmployerForm !== false);

function createEmployerForm(employer) {
  return buildEntityFormValues(EMPLOYER_FORM_DEFAULTS, EMPLOYER_VISIBLE_FIELDS, employer);
}

const VERIFICATION_STATUSES = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-700", icon: Clock },
  under_review: { label: "Under Review", color: "bg-amber-100 text-amber-800", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: ShieldAlert },
};

export default function EmployerProfile({ employer, setEmployer }) {
  const { user } = useAuthStore();
  const { settings: appSettings } = useSiteSettings();
  const [form, setForm] = useState(() => createEmployerForm(employer));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const { data: members = [] } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => teamService.list(),
  });
  const currentMember = members.find((m) => m.userId === user?.id);
  const isRecruiter = currentMember?.role === "recruiter";

  const maxDateOfBirth = getAdultDateMax();
  const companyFormConfig = appSettings?.employer_company_form_config || {};

  useEffect(() => {
    setForm(createEmployerForm(employer));
  }, [employer]);

  const visibleGroups = useMemo(
    () =>
      COMPANY_FIELD_GROUPS.map((group) => ({
        ...group,
        fields: group.fields.filter((field) => {
          if (field.adminOnly || field.manageInEmployerForm === false) return false;
          return companyFormConfig?.[field.key]?.visible !== false;
        }),
      })).filter((group) => group.fields.length),
    [companyFormConfig],
  );

  const updateField = (fieldKey, value) => {
    setForm((current) => ({ ...current, [fieldKey]: value }));
  };

  const handleSave = async () => {
    if (form.date_of_birth && !isAtLeast18(form.date_of_birth)) {
      toast.error("Invalid Date of Birth — Employer profile users must be at least 18 years old.");
      return;
    }

    for (const group of visibleGroups) {
      for (const field of group.fields) {
        const control = companyFormConfig?.[field.key];
        if (control?.required && !hasFieldValue(field, form[field.key])) {
          toast.error(`Missing required field — ${field.label} is required before saving this profile.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const updated = await employerService.update(employer.id, form);
      setEmployer({ ...employer, ...updated });
      toast.success("Profile Updated — Your employer profile has been saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { verificationDocUrl } = await employerService.uploadVerificationDoc(employer.id, file);
      setEmployer({ ...employer, verificationDocUrl, verificationStatus: "under_review" });
      toast.success("Document uploaded successfully. Your profile is now under review.");
    } catch (err) {
      toast.error(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const status = VERIFICATION_STATUSES[employer.verificationStatus] || VERIFICATION_STATUSES.draft;
  const StatusIcon = status.icon;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Company Profile</CardTitle>
        <Badge className={`${status.color} border-none flex items-center gap-1.5 px-3 py-1`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {employer.verificationStatus === "draft" && (
          <Alert className="bg-amber-50 border-amber-200">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Verification Required</AlertTitle>
            <AlertDescription className="text-amber-700 text-xs">
              To publish jobs, you must upload your Employer Registration Document.
            </AlertDescription>
          </Alert>
        )}

        {employer.adminReviewNote && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Admin Review Note</AlertTitle>
            <AlertDescription className="text-xs">
              {employer.adminReviewNote}
            </AlertDescription>
          </Alert>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Verification Document</h3>
              <p className="text-xs text-muted-foreground">Upload your Employer Registration No. document (PDF, JPG, PNG)</p>
            </div>
            <div className="flex items-center gap-3">
              {employer.verificationDocUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={employer.verificationDocUrl} target="_blank" rel="noreferrer">View Current</a>
                </Button>
              )}
              <div className="relative">
                <input
                  type="file"
                  id="verification-doc"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,image/*"
                  disabled={uploading || employer.verificationStatus === "approved"}
                />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  asChild
                  disabled={uploading || employer.verificationStatus === "approved" || isRecruiter}
                >
                  <label htmlFor="verification-doc" className={`${uploading || employer.verificationStatus === "approved" || isRecruiter ? 'cursor-not-allowed' : 'cursor-pointer'} flex items-center gap-2`}>
                    <FileUp className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Upload New"}
                  </label>
                </Button>
              </div>
            </div>
          </div>
          {isRecruiter && (
            <p className="text-[10px] text-muted-foreground mt-1 italic">Only owners and admins can upload verification documents.</p>
          )}
          {employer.verificationStatus === "under_review" && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
              <Clock className="w-3.5 h-3.5" />
              Your document is currently being reviewed by our team.
            </div>
          )}
        </section>

        <hr className="border-muted" />
        {!visibleGroups.length ? (
          <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            All employer company fields are currently hidden. Enable them from Admin Site CMS.
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
                  field={{
                    ...field,
                    inputProps: field.key === "date_of_birth" ? { max: maxDateOfBirth } : undefined,
                  }}
                  value={form[field.key]}
                  onChange={(value) => updateField(field.key, value)}
                  required={Boolean(companyFormConfig?.[field.key]?.required)}
                />
              ))}
            </div>
          </section>
        ))}

        {isRecruiter ? (
          <Alert className="bg-muted border-none">
            <AlertDescription className="text-xs">
              You are viewing this profile as a <strong>Recruiter</strong>. Company details and verification can only be modified by the account Owner or Admin.
            </AlertDescription>
          </Alert>
        ) : (
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
