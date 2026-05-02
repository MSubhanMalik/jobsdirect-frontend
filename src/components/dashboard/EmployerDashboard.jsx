import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import authService from "@/services/auth";
import jobService from "@/services/job";
import applicationService from "@/services/application";
import employerService from "@/services/employer";
import paymentService from "@/services/payment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { COMPANY_FIELDS, hasFieldValue } from "@/lib/siteSettings";
import { LogOut, Lock, Users } from "lucide-react";
import JobPostForm from "./JobPostForm";
import EmployerProfile from "./EmployerProfile";
import DashboardStats from "./employer/DashboardStats";
import VerificationBanner from "./employer/VerificationBanner";
import JobList from "./employer/JobList";
import ApplicationList from "./employer/ApplicationList";
import BillingTab from "./employer/BillingTab";

function isProfileReadyForSubmission(employer, companyFormConfig = {}) {
  const configurableFields = COMPANY_FIELDS.filter((field) => !field.adminOnly && field.manageInEmployerForm !== false);
  return configurableFields
    .filter((field) => companyFormConfig?.[field.key]?.visible !== false && companyFormConfig?.[field.key]?.required)
    .every((field) => hasFieldValue(field, employer?.[field.key]));
}

export default function EmployerDashboard({ user, employer, setEmployer }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings: publicSettings } = useSiteSettings();
  const companyFormConfig = publicSettings.employer_company_form_config || {};
  const approvalRequired = publicSettings.employer_approval_required !== false;
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState(null);
  const formContainerRef = useRef(null);
  const queryClient = useQueryClient();
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

  const { data: paymentPlans = [] } = useQuery({
    queryKey: ["payment-plans"],
    queryFn: () => paymentService.listPlans(),
    enabled: isApproved,
  });

  // Sync employer subscription/credit status from Stripe on dashboard load
  useEffect(() => {
    if (!isApproved) return;
    paymentService.getBalance(employer?.id).then((balance) => {
      if (!balance) return;
      const updates = {};
      if (balance.credits !== undefined && balance.credits !== employer.credits) updates.credits = balance.credits;
      if (balance.candidate_database_access !== undefined && balance.candidate_database_access !== employer.candidate_database_access) updates.candidate_database_access = balance.candidate_database_access;
      if (balance.candidate_database_status && balance.candidate_database_status !== employer.candidate_database_status) updates.candidate_database_status = balance.candidate_database_status;
      if (Object.keys(updates).length) setEmployer((prev) => ({ ...prev, ...updates }));
    }).catch(() => {});
  }, [employer?.id, isApproved]);

  const profileReady = isProfileReadyForSubmission(employer, companyFormConfig);
  const activeJobs = jobs.filter((j) => j.status === "approved");
  const pendingJobs = jobs.filter((j) => j.status === "pending_review");
  const creditPlans = paymentPlans.filter((plan) => plan.kind === "credits");
  const subscriptionPlans = paymentPlans.filter((plan) => plan.kind === "candidate_database");

  useEffect(() => {
    if (!showJobForm || !editingJob || !formContainerRef.current) return;
    formContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showJobForm, editingJob]);

  // Handle payment redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");

    if (payment === "cancelled") {
      toast.info("Payment cancelled — No charge was made.");
      navigate("/dashboard", { replace: true });
      return;
    }
    if (payment !== "success" || !sessionId) return;

    setCheckoutPlanId("syncing");
    paymentService.syncCheckoutSession(sessionId)
      .then((result) => {
        if (result.employer) setEmployer((prev) => ({ ...prev, ...result.employer }));
        queryClient.invalidateQueries({ queryKey: ["employer-jobs", user.email] });
        toast.success(result.success ? "Payment complete — Your account has been updated." : "Payment received — Stripe is still confirming this payment.");
      })
      .catch((error) => {
        toast.error(`Could not confirm payment — ${error.message || "Please refresh your dashboard in a moment."}`);
      })
      .finally(() => {
        setCheckoutPlanId(null);
        navigate("/dashboard", { replace: true });
      });
  }, [location.search, navigate, queryClient, setEmployer, user.email]);

  const handleSubmitForVerification = async () => {
    if (!profileReady) {
      toast.error("Complete your profile first — Please complete all required company fields before submitting for verification.");
      return;
    }
    setSubmittingVerification(true);
    try {
      const updated = await employerService.update(employer.id, {
        verification_status: approvalRequired ? "pending" : "approved",
        admin_review_note: "",
        approval_submitted_at: new Date().toISOString(),
        approved_at: approvalRequired ? employer.approved_at : new Date().toISOString(),
      });
      setEmployer(updated);
      toast.success(approvalRequired ? "Submitted for Verification — Your employer account is now pending admin approval." : "Employer Account Active — Your employer account has full access.");
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleCheckout = async (planId) => {
    setCheckoutPlanId(planId);
    try {
      const session = await paymentService.createCheckoutSession({ plan_id: planId, employer_id: employer.id });
      window.location.assign(session.url);
    } catch (error) {
      toast.error(`Checkout unavailable — ${error.message || "Stripe checkout could not be started."}`);
      setCheckoutPlanId(null);
    }
  };

  const handleBillingPortal = async () => {
    setCheckoutPlanId("portal");
    try {
      const session = await paymentService.createPortalSession({ employer_id: employer.id });
      window.location.assign(session.url);
    } catch (error) {
      toast.error(`Billing portal unavailable — ${error.message || "Stripe billing portal could not be opened."}`);
      setCheckoutPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Employer Dashboard</h1>
              <p className="text-primary-foreground/70 mt-1">
                {user.first_name} {user.last_name}{employer.company_name ? ` — ${employer.company_name}` : ''}
              </p>
              <p className="text-primary-foreground/50 text-sm">{user.email}</p>
            </div>
            <Button variant="ghost" className="text-primary-foreground/60 hover:text-primary-foreground" onClick={() => authService.logout("/")}>
              <LogOut className="w-4 h-4 mr-2" />Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <Tabs defaultValue={isApproved ? "jobs" : "overview"}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile Setup</TabsTrigger>
            {isApproved && <TabsTrigger value="jobs">My Jobs</TabsTrigger>}
            {isApproved && <TabsTrigger value="applications">Applications</TabsTrigger>}
            {isApproved && <TabsTrigger value="billing">Billing</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
              <Card>
                <CardHeader><CardTitle className="text-lg">Access Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-800">Allowed now</p>
                    <p className="text-sm text-emerald-700 mt-1">View your dashboard and start profile setup immediately after email verification.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Next step</p>
                    <p className="text-sm text-muted-foreground mt-1">Fill in your company profile and submit your account for admin verification.</p>
                  </div>
                  {!isApproved && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <Lock className="w-4 h-4 text-amber-700 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-900">Blocked until approval</p>
                          <p className="text-sm text-amber-800 mt-1">Posting jobs and employee database access are disabled while your employer account is in limited mode.</p>
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
          </TabsContent>

          <TabsContent value="profile">
            <EmployerProfile employer={employer} setEmployer={setEmployer} />
          </TabsContent>

          {isApproved && (
            <TabsContent value="jobs">
              <JobList
                jobs={jobs}
                user={user}
                employer={employer}
                showJobForm={showJobForm}
                editingJob={editingJob}
                setShowJobForm={setShowJobForm}
                setEditingJob={setEditingJob}
                formContainerRef={formContainerRef}
                JobPostForm={JobPostForm}
              />
            </TabsContent>
          )}

          {isApproved && (
            <TabsContent value="applications">
              <h2 className="text-lg font-semibold mb-6">Received Applications</h2>
              <ApplicationList applications={applications} userEmail={user.email} />
            </TabsContent>
          )}

          {isApproved && (
            <TabsContent value="billing">
              <BillingTab
                employer={employer}
                setEmployer={setEmployer}
                creditPlans={creditPlans}
                subscriptionPlans={subscriptionPlans}
                checkoutPlanId={checkoutPlanId}
                onCheckout={handleCheckout}
                onBillingPortal={handleBillingPortal}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
