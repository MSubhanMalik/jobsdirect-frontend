import React from "react";
import { Link, useOutletContext } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Lock, Send, CheckCircle, Eye, Briefcase } from "lucide-react";
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold">Welcome back, {user.firstName}!</h2>
            <p className="text-muted-foreground">Here's what's happening with your applications.</p>
          </div>
          <Link to="/jobs">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Briefcase className="w-4 h-4 mr-2" /> Browse New Jobs
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Send className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Applications</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-800 uppercase tracking-wider">Shortlisted</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {applications.filter(a => a.status === 'shortlisted').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
            <CardTitle className="text-lg">Recent Applications</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard/applications">View All <Send className="w-4 h-4 ml-2" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {applications.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <p>You haven't applied to any jobs yet.</p>
              </div>
            ) : (
              <div className="divide-y">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {app.company_name?.charAt(0) || "J"}
                      </div>
                      <div>
                        <Link to={`/dashboard/applications/${app.id}`} className="font-bold text-sm hover:text-primary transition-colors">
                          {app.job_title}
                        </Link>
                        <p className="text-xs text-muted-foreground">{app.company_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-[10px] capitalize font-medium">{app.status}</Badge>
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/dashboard/applications/${app.id}`}><Eye className="w-4 h-4" /></Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
