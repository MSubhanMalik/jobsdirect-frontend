import React from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import jobService from "@/services/job";
import applicationService from "@/services/application";
import paymentService from "@/services/payment";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { COMPANY_FIELDS, hasFieldValue } from "@/lib/siteSettings";
import DashboardStats from "@/components/dashboard/employer/DashboardStats";
import VerificationBanner from "@/components/dashboard/employer/VerificationBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";
import employerService from "@/services/employer";

function isProfileReadyForSubmission(employer, companyFormConfig = {}) {
  const configurableFields = COMPANY_FIELDS.filter((f) => !f.adminOnly && f.manageInEmployerForm !== false);
  return configurableFields
    .filter((f) => companyFormConfig?.[f.key]?.visible !== false && companyFormConfig?.[f.key]?.required)
    .every((f) => hasFieldValue(f, employer?.[f.key]));
}

export default function DashboardOverview() {
  const { user, employer, employee, setEmployer, isEmployer } = useOutletContext();
  const { settings: publicSettings } = useSiteSettings();

  if (!isEmployer) {
    // Employee overview — simple applications count
    const { data: appsData } = useQuery({
      queryKey: ["my-applications", user.email],
      queryFn: () => applicationService.list({ employee_email: user.email, pageSize: 100 }),
    });
    const applications = appsData?.items || [];

    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Welcome back, {user.firstName}</h2>
        <p className="text-muted-foreground">You have {applications.length} application{applications.length !== 1 ? "s" : ""}.</p>
      </div>
    );
  }

  // Employer overview
  const companyFormConfig = publicSettings.employer_company_form_config || {};
  const approvalRequired = publicSettings.employer_approval_required !== false;
  const isApproved = !approvalRequired || employer.verification_status === "approved";

  const { data: jobsData } = useQuery({
    queryKey: ["employer-jobs", user.email],
    queryFn: () => jobService.list({ created_by: user.email, pageSize: 100 }),
  });
  const jobs = jobsData?.items || [];

  const { data: appsData } = useQuery({
    queryKey: ["employer-applications", user.email],
    queryFn: () => applicationService.list({ employer_email: user.email, pageSize: 100 }),
  });
  const applications = appsData?.items || [];

  const profileReady = isProfileReadyForSubmission(employer, companyFormConfig);
  const activeJobs = jobs.filter((j) => j.status === "approved");
  const pendingJobs = jobs.filter((j) => j.status === "pending_review");

  const [submittingVerification, setSubmittingVerification] = React.useState(false);

  const handleSubmitForVerification = async () => {
    if (!profileReady) { toast.error("Complete your profile first."); return; }
    setSubmittingVerification(true);
    try {
      const updated = await employerService.update(employer.id, {
        verification_status: approvalRequired ? "pending" : "approved",
        admin_review_note: "",
        approval_submitted_at: new Date().toISOString(),
        approved_at: approvalRequired ? employer.approved_at : new Date().toISOString(),
      });
      setEmployer(updated);
      toast.success(approvalRequired ? "Submitted for verification." : "Employer account active.");
    } finally { setSubmittingVerification(false); }
  };

  return (
    <div className="space-y-6">
      <DashboardStats
        activeJobs={activeJobs.length}
        pendingJobs={pendingJobs.length}
        applications={applications.length}
        credits={employer.credits || 0}
        isApproved={isApproved}
      />

      {!isApproved && (
        <VerificationBanner employer={employer} submitting={submittingVerification} onSubmit={handleSubmitForVerification} />
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <Card>
          <CardHeader><CardTitle className="text-lg">Access Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800">Allowed now</p>
              <p className="text-sm text-emerald-700 mt-1">View your dashboard and start profile setup immediately.</p>
            </div>
            {!isApproved && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-amber-700 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Blocked until approval</p>
                    <p className="text-sm text-amber-800 mt-1">Posting jobs and employee database access stay locked until admin approval.</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Checklist</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span>Email verified</span><Badge>{user.email}</Badge></div>
            <div className="flex items-center justify-between"><span>Profile ready</span><Badge variant={profileReady ? "default" : "secondary"}>{profileReady ? "Ready" : "Incomplete"}</Badge></div>
            <div className="flex items-center justify-between"><span>Admin decision</span><Badge variant={isApproved ? "default" : "secondary"} className="capitalize">{employer.verification_status || "draft"}</Badge></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
