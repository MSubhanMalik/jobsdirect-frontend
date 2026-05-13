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
import { Save, ShieldCheck, ShieldAlert, FileUp, CheckCircle, Clock, Upload, FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
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
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { verification_doc_url } = await employerService.uploadVerificationDoc(employer.id, file);
      setEmployer({ ...employer, verification_doc_url });
      toast.success("Document uploaded successfully. You can now submit your profile for verification.");
    } catch (err) {
      toast.error(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitForVerification = async () => {
    if (!employer.verification_doc_url) {
      toast.error("Document Required — Please upload a verification document first.");
      return;
    }

    setSaving(true);
    try {
      const updated = await employerService.submitForVerification(employer.id);
      setEmployer({ ...employer, ...updated });
      toast.success("Verification Submitted — Your profile is now under review.");
    } catch (err) {
      toast.error(err.message || "Failed to submit for verification");
    } finally {
      setSaving(false);
    }
  };

  const status = VERIFICATION_STATUSES[employer.verification_status] || VERIFICATION_STATUSES.draft;
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
        {employer.verification_status === "draft" && (
          <Alert className="bg-amber-50 border-amber-200">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Verification Required</AlertTitle>
            <AlertDescription className="text-amber-700 text-xs">
              To publish jobs, you must verify your company. Search for your company in the CRO registry and upload your Revenue Employer Registration Certificate.
            </AlertDescription>
          </Alert>
        )}

        {employer.admin_review_note && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Admin Review Note</AlertTitle>
            <AlertDescription className="text-xs">{employer.admin_review_note}</AlertDescription>
          </Alert>
        )}

        {/* CRO Company Search */}
        <CROCompanySearch employer={employer} setEmployer={setEmployer} disabled={employer.verification_status === "approved" || isRecruiter} />

        {/* Verification Document Upload */}
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Revenue Employer Registration Certificate</h3>
            <p className="text-xs text-muted-foreground">Upload your Employer Registration Certificate issued by the Revenue Commissioners (PDF, JPG, PNG). This confirms your PAYE/PRSI registration.</p>
          </div>
          <div className="flex items-center gap-3">
            {employer.verification_doc_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={employer.verification_doc_url} target="_blank" rel="noreferrer">View Current</a>
              </Button>
            )}
            <div className="relative">
              <input type="file" id="verification-doc" className="hidden" onChange={handleFileUpload} accept=".pdf,image/*" disabled={uploading || employer.verification_status === "approved"} />
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" asChild disabled={uploading || employer.verification_status === "approved" || isRecruiter}>
                  <label htmlFor="verification-doc" className={`${uploading || employer.verification_status === "approved" || isRecruiter ? 'cursor-not-allowed' : 'cursor-pointer'} flex items-center gap-2`}>
                    <FileUp className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Upload Certificate"}
                  </label>
                </Button>
                {employer.verification_status === "draft" && employer.verification_doc_url && employer.cro_number && (
                  <Button onClick={handleSubmitForVerification} disabled={saving || uploading} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    Submit for Verification
                  </Button>
                )}
              </div>
            </div>
          </div>
          {isRecruiter && <p className="text-[10px] text-muted-foreground mt-1 italic">Only owners and admins can upload verification documents.</p>}
          {employer.verification_status === "under_review" && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
              <Clock className="w-3.5 h-3.5" />
              Your documents are currently being reviewed by our team.
            </div>
          )}
        </section>

        {/* Requested Documents */}
        <DocumentUploadsSection employerId={employer.id} />

        <hr className="border-muted" />
        {!visibleGroups.length ? (
          <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            All employer company fields are currently hidden. Enable them from Admin Settings.
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

function CROCompanySearch({ employer, setEmployer, disabled }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(employer.cro_number ? true : false);

  const handleSearch = async () => {
    if (query.length < 2) return;
    setSearching(true);
    try {
      const data = await employerService.searchCRO(query);
      setResults(data);
    } catch { setResults([]); }
    finally { setSearching(false); }
  };

  const handleSelect = async (company) => {
    try {
      const address = [company.address, company.eircode].filter(Boolean).join(", ");
      await employerService.update(employer.id, {
        company_name: company.company_name,
        cro_number: company.company_num,
        business_address: address,
      });
      setEmployer({ ...employer, company_name: company.company_name, cro_number: company.company_num, business_address: address });
      setSelected(true);
      setResults([]);
      setQuery("");
      toast.success(`Company selected: ${company.company_name} (CRO: ${company.company_num})`);
    } catch (err) { toast.error(err.message || "Failed to link company"); }
  };

  if (disabled) {
    return employer.cro_number ? (
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">CRO Company Registration</h3>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-800">{employer.company_name}</p>
            <p className="text-xs text-emerald-600">CRO: {employer.cro_number}{employer.business_address ? ` · ${employer.business_address}` : ""}</p>
          </div>
        </div>
      </section>
    ) : null;
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold">CRO Company Registration</h3>
        <p className="text-xs text-muted-foreground">Search the Companies Registration Office (CRO) registry to link your company.</p>
      </div>

      {selected && employer.cro_number ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-800">{employer.company_name}</p>
                <p className="text-xs text-emerald-600">CRO: {employer.cro_number}{employer.business_address ? ` · ${employer.business_address}` : ""}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelected(false)}>Change</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              placeholder="Search by company name..."
              className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <Button size="sm" className="h-9 rounded-lg" onClick={handleSearch} disabled={searching || query.length < 2}>
              {searching ? "Searching..." : "Search CRO"}
            </Button>
          </div>
          {results.length > 0 && (
            <div className="rounded-lg border border-border divide-y divide-border max-h-[200px] overflow-y-auto">
              {results.map((c) => (
                <button key={c.company_num} type="button" className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors" onClick={() => handleSelect(c)}>
                  <p className="text-sm font-medium">{c.company_name}</p>
                  <p className="text-xs text-muted-foreground">CRO: {c.company_num} · {c.company_status} · {c.address}</p>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function DocumentUploadsSection({ employerId }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(null);

  const { data: requests = [] } = useQuery({
    queryKey: ["document-requests", employerId],
    queryFn: () => employerService.getDocumentRequests(employerId),
    enabled: !!employerId,
  });

  const pending = requests.filter(r => r.status === "pending" || r.status === "rejected");
  const uploaded = requests.filter(r => r.status === "uploaded");
  const approved = requests.filter(r => r.status === "approved");

  if (!requests.length) return null;

  const handleUpload = async (requestId, file) => {
    setUploading(requestId);
    try {
      await employerService.uploadDocument(employerId, requestId, file);
      queryClient.invalidateQueries({ queryKey: ["document-requests", employerId] });
      toast.success("Document uploaded successfully");
    } catch (err) { toast.error(err.message || "Upload failed"); }
    finally { setUploading(null); }
  };

  const statusColors = {
    pending: "border-amber-200 bg-amber-50",
    uploaded: "border-blue-200 bg-blue-50",
    approved: "border-emerald-200 bg-emerald-50",
    rejected: "border-red-200 bg-red-50",
  };

  const statusLabels = {
    pending: "Awaiting Upload",
    uploaded: "Under Review",
    approved: "Approved",
    rejected: "Rejected — Please Re-upload",
  };

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold">Requested Documents</h3>
        <p className="text-xs text-muted-foreground">Admin has requested the following documents for verification.</p>
      </div>
      {requests.map((req) => (
        <div key={req.id} className={`rounded-lg border p-4 space-y-2 ${statusColors[req.status] || "border-border"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{req.title}</p>
              {req.description && <p className="text-xs text-muted-foreground">{req.description}</p>}
            </div>
            <Badge variant="outline" className="text-[0.6rem] shrink-0">{statusLabels[req.status] || req.status}</Badge>
          </div>
          {req.admin_note && (
            <p className="text-xs text-red-600 italic">Admin note: {req.admin_note}</p>
          )}
          {(req.status === "pending" || req.status === "rejected") && (
            <div>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-accent hover:underline">
                <Upload className="w-3.5 h-3.5" />
                {uploading === req.id ? "Uploading..." : "Upload Document"}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  disabled={uploading === req.id}
                  onChange={(e) => { if (e.target.files?.[0]) handleUpload(req.id, e.target.files[0]); }}
                />
              </label>
            </div>
          )}
          {req.file_url && req.status !== "pending" && (
            <a href={req.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
              <FileText className="w-3 h-3" /> View uploaded file
            </a>
          )}
        </div>
      ))}
    </section>
  );
}
