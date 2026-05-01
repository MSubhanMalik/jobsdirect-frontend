import React, { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, CheckCircle2, ClipboardList, Gauge, Mail, Plus, ShieldCheck, BarChart3, ChevronRight, ArrowRight } from "lucide-react";
import { StatCard, SectionHeader, EmptyState } from "../shared/UIComponents";
import { formatDate } from "../shared/helpers";
import { queryKeys } from "../shared/constants";
import jobService from "@/services/job";
import employerService from "@/services/employer";
import applicationService from "@/services/application";
import contactService from "@/services/contact";
import paymentService from "@/services/payment";

const typeConfig = {
  Job: { dot: "bg-accent" },
  Application: { dot: "bg-blue-500" },
  Message: { dot: "bg-amber-500" },
  Payment: { dot: "bg-emerald-500" },
  Company: { dot: "bg-indigo-500" },
};

export default function AdminOverview() {
  const { openEditor } = useOutletContext();
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({ queryKey: queryKeys.jobs, queryFn: () => jobService.list({ pageSize: 100 }) });
  const employersQuery = useQuery({ queryKey: queryKeys.employers, queryFn: () => employerService.list({ pageSize: 100 }) });
  const applicationsQuery = useQuery({ queryKey: queryKeys.applications, queryFn: () => applicationService.list({ pageSize: 100 }) });
  const messagesQuery = useQuery({ queryKey: queryKeys.messages, queryFn: () => contactService.list() });
  const paymentsQuery = useQuery({ queryKey: queryKeys.payments, queryFn: () => paymentService.list() });

  const jobs = jobsQuery.data?.items || [];
  const employers = employersQuery.data?.items || [];
  const applications = applicationsQuery.data?.items || [];
  const messages = messagesQuery.data || [];
  const payments = paymentsQuery.data || [];

  const stats = useMemo(() => {
    const pendingJobs = jobs.filter((j) => j.status === "pending_review").length;
    const liveJobs = jobs.filter((j) => j.status === "approved").length;
    const pendingEmployers = employers.filter((e) => ["pending", "submitted"].includes(e.verification_status)).length;
    const newMessages = messages.filter((m) => m.status === "new").length;
    return { pendingJobs, liveJobs, pendingEmployers, newMessages };
  }, [jobs, employers, messages]);

  const updateEntity = async (entity, id, updates, keys, title) => {
    const services = { Job: jobService, Employer: employerService };
    try {
      await services[entity].update(id, updates);
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      toast.success(title);
    } catch { toast.error(`Failed to update ${entity}`); }
  };

  const pendingQueue = [
    ...jobs.filter((job) => job.status === "pending_review").slice(0, 5).map((job) => ({
      id: job.id, title: job.title,
      detail: `${job.company_name || "Company"} · ${job.location || "Location"}`,
      type: "Job",
      action: () => updateEntity("Job", job.id, { status: "approved" }, [queryKeys.jobs], "Job approved"),
    })),
    ...employers.filter((e) => ["pending", "submitted"].includes(e.verification_status)).slice(0, 3).map((employer) => ({
      id: employer.id, title: employer.company_name,
      detail: employer.user_email,
      type: "Company",
      action: () => updateEntity("Employer", employer.id, { verification_status: "approved", approved_at: new Date().toISOString() }, [queryKeys.employers], "Company approved"),
    })),
  ];

  const recentActivity = [
    ...jobs.map((item) => ({ type: "Job", title: item.title, date: item.updatedAt || item.createdAt })),
    ...applications.map((item) => ({ type: "Application", title: item.job_title || item.employee_email, date: item.updatedAt || item.createdAt })),
    ...messages.map((item) => ({ type: "Message", title: item.subject, date: item.updatedAt || item.createdAt })),
    ...payments.map((item) => ({ type: "Payment", title: item.plan_id || item.stripe_session_id, date: item.updatedAt || item.createdAt })),
  ].filter((item) => item.date).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Command Center"
        description="Manage publishing, moderation, accounts, and site content."
        action={
          <Button onClick={() => openEditor("job")} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-5 h-9 text-sm font-medium">
            <Plus className="h-4 w-4 mr-1.5" /> New Job
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Briefcase} label="Live Jobs" value={stats.liveJobs} subtext={`${jobs.length} total listings`} />
        <StatCard icon={Gauge} label="Needs Review" value={stats.pendingJobs + stats.pendingEmployers} subtext="Jobs & companies" />
        <StatCard icon={ClipboardList} label="Applications" value={applications.length} subtext="Candidate pipeline" />
        <StatCard icon={Mail} label="New Messages" value={stats.newMessages} subtext={`${messages.length} total`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Approval Queue */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
            <h3 className="text-base font-display font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" /> Approval Queue
            </h3>
            <span className="text-xs text-muted-foreground">{pendingQueue.length} pending</span>
          </div>
          {pendingQueue.length ? (
            <div className="divide-y divide-border/30">
              {pendingQueue.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${typeConfig[item.type]?.dot || "bg-muted-foreground"}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                        <Badge variant="secondary" className="text-[0.6rem] shrink-0">{item.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg h-8 text-xs font-medium shrink-0"
                    onClick={item.action}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Queue is clear" description="No approvals waiting." />
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40">
            <h3 className="text-base font-display font-semibold text-foreground">Recent Activity</h3>
          </div>
          {recentActivity.length ? (
            <div className="divide-y divide-border/30">
              {recentActivity.map((item, index) => (
                <div key={`${item.type}-${index}`} className="flex items-center gap-3 px-6 py-3.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${typeConfig[item.type]?.dot || "bg-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title || item.type}</p>
                    <p className="text-[0.65rem] text-muted-foreground">{item.type}</p>
                  </div>
                  <span className="text-[0.65rem] text-muted-foreground whitespace-nowrap shrink-0">{formatDate(item.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No activity yet" />
          )}
        </div>
      </div>
    </div>
  );
}
