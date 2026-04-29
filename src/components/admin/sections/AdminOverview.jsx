import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, CheckCircle2, ClipboardList, Gauge, Mail, Plus, ShieldCheck, BarChart3 } from "lucide-react";
import { StatCard, SectionHeader, EmptyState } from "../shared/UIComponents";
import { formatDate } from "../shared/helpers";

export default function AdminOverview({ stats, jobs, employers, applications, messages, payments, openEditor, updateEntity, queryKeys }) {
  const pendingQueue = [
    ...jobs.filter((job) => job.status === "pending_review").slice(0, 4).map((job) => ({
      id: job.id,
      title: job.title,
      detail: `${job.company_name || "Company"} - ${job.location || "Location"}`,
      type: "Job",
      action: () => updateEntity("Job", job.id, { status: "approved" }, [queryKeys.jobs], "Job approved"),
    })),
    ...employers.filter((employer) => ["pending", "submitted"].includes(employer.verification_status)).slice(0, 3).map((employer) => ({
      id: employer.id,
      title: employer.company_name,
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
  ]
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  const pipeline = [
    { label: "Pending jobs", value: stats.pendingJobs, total: Math.max(jobs.length, 1), tone: "bg-amber-500" },
    { label: "Live jobs", value: stats.liveJobs, total: Math.max(jobs.length, 1), tone: "bg-emerald-500" },
    { label: "Applications", value: applications.length, total: Math.max(applications.length + jobs.length, 1), tone: "bg-blue-600" },
    { label: "New messages", value: stats.newMessages, total: Math.max(messages.length, 1), tone: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Command center"
        description="Run publishing, moderation, accounts, and site content from one place."
        action={<Button onClick={() => openEditor("job")}><Plus className="h-4 w-4" />New Job</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Briefcase} label="Live jobs" value={stats.liveJobs} subtext={`${jobs.length} total listings`} tone="accent" />
        <StatCard icon={Gauge} label="Needs review" value={stats.pendingJobs + stats.pendingEmployers} subtext="Jobs and companies" tone="amber" />
        <StatCard icon={ClipboardList} label="Applications" value={applications.length} subtext="Candidate pipeline" tone="blue" />
        <StatCard icon={Mail} label="New messages" value={stats.newMessages} subtext={`${messages.length} inbox items`} tone="primary" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Approval queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingQueue.length ? (
              <div className="space-y-3">
                {pendingQueue.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{item.type}</Badge>
                        <p className="truncate text-sm font-medium">{item.title}</p>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={item.action}>
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No approvals waiting" description="Everything that needs review has been cleared." />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-accent" />
              Marketplace health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipeline.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${item.tone}`}
                    style={{ width: `${Math.min(100, Math.round((item.value / item.total) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length ? (
            <div className="divide-y">
              {recentActivity.map((item, index) => (
                <div key={`${item.type}-${item.title}-${index}`} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title || item.type}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(item.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No activity yet" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
