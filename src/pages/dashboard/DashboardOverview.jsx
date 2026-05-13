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
import { Lock, Send, CheckCircle, Eye, Briefcase, ArrowRight, ChevronRight, Clock, XCircle, FileText, Sparkles, ArrowUpRight } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import employerService from "@/services/employer";

function isProfileReadyForSubmission(employer, companyFormConfig = {}) {
  const configurableFields = COMPANY_FIELDS.filter((f) => !f.adminOnly && f.manageInEmployerForm !== false);
  return configurableFields
    .filter((f) => companyFormConfig?.[f.key]?.visible !== false && companyFormConfig?.[f.key]?.required)
    .every((f) => hasFieldValue(f, employer?.[f.key]));
}

const statusConfig = {
  submitted: { icon: Clock, color: "text-amber-600", dot: "bg-amber-500", label: "Submitted" },
  reviewed: { icon: Eye, color: "text-blue-600", dot: "bg-blue-500", label: "Reviewed" },
  shortlisted: { icon: CheckCircle, color: "text-emerald-600", dot: "bg-emerald-500", label: "Shortlisted" },
  rejected: { icon: XCircle, color: "text-red-600", dot: "bg-red-500", label: "Rejected" },
  hired: { icon: CheckCircle, color: "text-emerald-700", dot: "bg-emerald-600", label: "Hired" },
};

export default function DashboardOverview() {
  const { user, employer, employee, setEmployer, isEmployer } = useOutletContext();
  const { settings: publicSettings } = useSiteSettings();

  if (!isEmployer) {
    return <EmployeeOverview user={user} employee={employee} />;
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

  const displayName = user.first_name || "there";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {employer.company_name ? `Managing ${employer.company_name}` : "Here's your employer dashboard."}
          </p>
        </div>
        {isApproved && (
          <Link to="/dashboard/jobs">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-10 font-medium group shrink-0">
              <FileText className="w-4 h-4 mr-2" />
              Post a Job
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <DashboardStats
        activeJobs={activeJobs.length}
        pendingJobs={pendingJobs.length}
        applications={applications.length}
        credits={employer.credits || 0}
        isApproved={isApproved}
      />

      {/* Verification */}
      {!isApproved && (
        <VerificationBanner employer={employer} submitting={submittingVerification} onSubmit={handleSubmitForVerification} />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "My Jobs", desc: "Manage your listings", icon: FileText, to: "/dashboard/jobs", primary: true },
          { label: "Applications", desc: "Review candidates", icon: Send, to: "/dashboard/applications" },
        ].map((action) => (
          <Link key={action.label} to={action.to}>
            <div className={`rounded-xl border p-5 flex items-center gap-4 transition-all duration-200 group cursor-pointer hover:-translate-y-0.5 ${
              action.primary
                ? "bg-foreground text-background border-foreground hover:shadow-lg"
                : "bg-card border-border/50 hover:shadow-md hover:border-border"
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                action.primary ? "bg-background/10" : "bg-muted"
              }`}>
                <action.icon className={`w-5 h-5 ${action.primary ? "text-background/70" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${action.primary ? "" : "text-foreground"}`}>{action.label}</p>
                <p className={`text-xs mt-0.5 ${action.primary ? "text-background/50" : "text-muted-foreground"}`}>{action.desc}</p>
              </div>
              <ArrowUpRight className={`w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                action.primary ? "text-background/40" : "text-muted-foreground/40"
              }`} />
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom row: Access + Checklist */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40">
            <h3 className="text-base font-display font-semibold text-foreground">Access Summary</h3>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800">Allowed now</p>
              <p className="text-sm text-emerald-700 mt-1">Dashboard access and profile setup are available immediately.</p>
            </div>
            {!isApproved && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Blocked until approval</p>
                    <p className="text-sm text-amber-800 mt-1">Posting jobs and candidate database access stay locked until admin approval.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40">
            <h3 className="text-base font-display font-semibold text-foreground">Checklist</h3>
          </div>
          <div className="px-6 py-5 space-y-4">
            {[
              { label: "Email verified", value: user.email, done: true },
              { label: "Profile complete", value: profileReady ? "Ready" : "Incomplete", done: profileReady },
              { label: "Admin approval", value: employer.verification_status || "draft", done: isApproved },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? "bg-emerald-100" : "bg-muted"}`}>
                    {item.done ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <Badge variant={item.done ? "default" : "secondary"} className="text-[0.65rem] capitalize">{item.value}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      {applications.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
            <h3 className="text-base font-display font-semibold text-foreground">Recent Applications</h3>
            <Link to="/dashboard/applications" className="text-xs font-medium text-muted-foreground hover:text-accent transition-colors flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/30">
            {applications.slice(0, 5).map((app) => {
              const config = statusConfig[app.status] || statusConfig.submitted;
              return (
                <Link
                  key={app.id}
                  to={`/dashboard/applications/${app.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <span className="text-sm font-display font-bold text-muted-foreground">
                      {(app.employee_name || "C")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate">
                      {app.employee_name || "Candidate"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">Applied for {app.job_title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-border group-hover:text-muted-foreground shrink-0 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeOverview({ user, employee }) {
  const { data: appsData } = useQuery({
    queryKey: ["my-applications", user.email],
    queryFn: () => applicationService.list({ employee_email: user.email, pageSize: 100 }),
  });
  const applications = appsData?.items || [];
  const shortlisted = applications.filter((a) => a.status === "shortlisted").length;

  const { data: cvsData } = useQuery({
    queryKey: ["my-cvs-count"],
    queryFn: async () => {
      const cvService = (await import("@/services/cv")).default;
      return cvService.list();
    },
  });
  const cvCount = Array.isArray(cvsData?.cvs) ? cvsData.cvs.length : 0;

  const displayName = user.first_name || "there";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your job search at a glance.</p>
        </div>
        <Link to="/jobs">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-10 font-medium group shrink-0">
            <Briefcase className="w-4 h-4 mr-2" />
            Browse Jobs
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          { label: "Applied", value: applications.length, icon: Send },
          { label: "Shortlisted", value: shortlisted, icon: Sparkles },
          { label: "CVs", value: cvCount, icon: FileText },
          { label: "Discoverable", value: employee.is_searchable ? "Yes" : "No", icon: Eye },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-card border border-border/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-muted-foreground/40" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {[
          { label: "Browse Jobs", desc: "Find your next role", icon: Briefcase, to: "/jobs", primary: true },
          { label: "Saved Jobs", desc: "Your bookmarked positions", icon: Briefcase, to: "/dashboard/saved" },
          { label: "Job Alerts", desc: "Get notified of new roles", icon: Sparkles, to: "/dashboard/alerts" },
        ].map((action) => (
          <Link key={action.label} to={action.to}>
            <div className={`rounded-xl border p-5 flex items-center gap-4 transition-all duration-200 group cursor-pointer hover:-translate-y-0.5 ${
              action.primary
                ? "bg-foreground text-background border-foreground hover:shadow-lg"
                : "bg-card border-border/50 hover:shadow-md hover:border-border"
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                action.primary ? "bg-background/10" : "bg-muted"
              }`}>
                <action.icon className={`w-5 h-5 ${action.primary ? "text-background/70" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${action.primary ? "" : "text-foreground"}`}>{action.label}</p>
                <p className={`text-xs mt-0.5 ${action.primary ? "text-background/50" : "text-muted-foreground"}`}>{action.desc}</p>
              </div>
              <ArrowUpRight className={`w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                action.primary ? "text-background/40" : "text-muted-foreground/40"
              }`} />
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Recent Applications */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
            <h2 className="text-base font-display font-semibold text-foreground">Recent Applications</h2>
            <Link to="/dashboard/applications" className="text-xs font-medium text-muted-foreground hover:text-accent transition-colors flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-muted-foreground/25" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No applications yet</p>
              <p className="text-xs text-muted-foreground mb-5">Start exploring and land your next opportunity.</p>
              <Link to="/jobs">
                <Button variant="outline" size="sm" className="rounded-full px-5 font-medium">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {applications.slice(0, 5).map((app) => {
                const config = statusConfig[app.status] || statusConfig.submitted;
                return (
                  <Link
                    key={app.id}
                    to={`/dashboard/applications/${app.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <span className="text-sm font-display font-bold text-muted-foreground">
                        {(app.company_name || "C")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate">
                        {app.job_title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{app.company_name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-border group-hover:text-muted-foreground shrink-0 transition-colors" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
