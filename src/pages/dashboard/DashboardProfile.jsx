import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import EmployerProfile from "@/components/dashboard/EmployerProfile";
import EmployeeProfile from "@/components/dashboard/EmployeeProfile";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import authService from "@/services/auth";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function DashboardProfile() {
  const { employer, employee, setEmployer, setEmployee, isEmployer } = useOutletContext();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        <h2 className="text-lg font-display font-semibold text-foreground">
          {isEmployer ? "Company Profile" : "My Profile"}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isEmployer
            ? "Manage your company information and settings."
            : "Your personal details, skills, and job preferences. Work experience, education, and certifications are managed per-CV in the CVs section."}
        </p>
      </div>

      {isEmployer ? (
        <EmployerProfile employer={employer} setEmployer={setEmployer} />
      ) : (
        <EmployeeProfile
          employee={employee}
          setEmployee={setEmployee}
          excludeGroups={["work_experience", "education", "certifications", "projects"]}
        />
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
