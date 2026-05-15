import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertTriangle, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import authService from "@/services/auth";
import employerService from "@/services/employer";
import employeeService from "@/services/employee";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import FormFieldRenderer from "@/components/forms/FormFieldRenderer";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  COMPANY_FIELD_GROUPS,
  COMPANY_FIELDS,
  EMPLOYER_FORM_DEFAULTS,
  buildEntityFormValues,
  hasFieldValue,
} from "@/lib/siteSettings";
import { getAdultDateMax, isAtLeast18 } from "@/lib/age";
import { useAuthStore } from "@/stores/authStore";

const CONTACT_GROUP_ID = "contact_person";

const CONTACT_FIELDS = COMPANY_FIELDS.filter(
  (f) => !f.adminOnly && f.manageInEmployerForm !== false
);

function createContactForm(employer) {
  return buildEntityFormValues(EMPLOYER_FORM_DEFAULTS, CONTACT_FIELDS, employer);
}

export default function DashboardUserProfile() {
  const { employer, employee, setEmployer, setEmployee, isEmployer } = useOutletContext();
  const { settings: appSettings } = useSiteSettings();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => (isEmployer ? createContactForm(employer) : {}));

  const companyFormConfig = appSettings?.employer_company_form_config || {};
  const maxDateOfBirth = getAdultDateMax();

  useEffect(() => {
    if (isEmployer && employer) {
      setForm(createContactForm(employer));
    }
  }, [employer, isEmployer]);

  const contactGroup = useMemo(() => {
    const group = COMPANY_FIELD_GROUPS.find((g) => g.id === CONTACT_GROUP_ID);
    if (!group) return null;
    const fields = group.fields.filter((field) => {
      if (field.adminOnly || field.manageInEmployerForm === false) return false;
      return companyFormConfig?.[field.key]?.visible !== false;
    });
    if (!fields.length) return null;
    return { ...group, fields };
  }, [companyFormConfig]);

  const updateField = (fieldKey, value) => {
    setForm((current) => ({ ...current, [fieldKey]: value }));
  };

  const handleSave = async () => {
    if (form.date_of_birth && !isAtLeast18(form.date_of_birth)) {
      toast.error("Invalid Date of Birth — You must be at least 18 years old.");
      return;
    }

    if (contactGroup) {
      for (const field of contactGroup.fields) {
        const control = companyFormConfig?.[field.key];
        if (control?.required && !hasFieldValue(field, form[field.key])) {
          toast.error(`Missing required field — ${field.label} is required.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      // Only send contact person fields
      const contactKeys = contactGroup?.fields.map((f) => f.key) || [];
      const payload = {};
      for (const key of contactKeys) {
        payload[key] = form[key];
      }

      const updated = await employerService.update(employer.id, payload);
      setEmployer({ ...employer, ...updated });

      // Sync name to auth store so header updates
      if (payload.first_name || payload.last_name) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setUser({
            ...currentUser,
            first_name: payload.first_name || currentUser.first_name,
            last_name: payload.last_name || currentUser.last_name,
          });
        }
      }

      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await authService.deleteAccount();
      toast.success("Account deleted.");
    } catch (err) {
      toast.error(`Could not delete account — ${err.message}`);
      setDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground">User Profile</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your personal contact details and account settings.
        </p>
      </div>

      {/* Contact Person Fields (employer) */}
      {isEmployer && contactGroup && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{contactGroup.title}</CardTitle>
            {contactGroup.description && (
              <p className="text-sm text-muted-foreground">{contactGroup.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {contactGroup.fields.map((field) => (
                <FormFieldRenderer
                  key={field.key}
                  field={{
                    ...field,
                    inputProps:
                      field.key === "date_of_birth" ? { max: maxDateOfBirth } : undefined,
                  }}
                  value={form[field.key]}
                  onChange={(value) => updateField(field.key, value)}
                  required={Boolean(companyFormConfig?.[field.key]?.required)}
                />
              ))}
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 mb-1">Delete Account</h3>
            <p className="text-sm text-red-800/70 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-lg h-9 text-sm font-medium"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete My Account
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Your Account"
        description="This will permanently delete your account, profile, applications, saved jobs, and all associated data. This cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete Everything"}
        variant="destructive"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDelete(false)}
        disabled={deleting}
      />
    </div>
  );
}
