import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import applicationService from "@/services/application";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Send, Clock, Eye, CheckCircle, XCircle, Mail, Calendar, ChevronRight } from "lucide-react";
import PaginationControls from "@/components/ui/pagination-controls";
import ApplicationList from "@/components/dashboard/employer/ApplicationList";

const statusConfig = {
  submitted: { dot: "bg-blue-500", label: "Submitted" },
  viewed: { dot: "bg-purple-500", label: "Viewed" },
  shortlisted: { dot: "bg-emerald-500", label: "Shortlisted" },
  contacted: { dot: "bg-amber-500", label: "Contacted" },
  interview: { dot: "bg-indigo-500", label: "Interview" },
  hired: { dot: "bg-green-600", label: "Hired" },
  rejected: { dot: "bg-red-500", label: "Rejected" },
  closed: { dot: "bg-muted-foreground", label: "Closed" },
};

export default function DashboardApplications() {
  const { user, isEmployer } = useOutletContext();
  const [page, setPage] = useState(1);

  const queryKey = isEmployer ? ["employer-applications", user.email, page] : ["my-applications", user.email, page];
  const queryFilter = isEmployer ? { employer_email: user.email } : { employee_email: user.email };

  const { data: appsData } = useQuery({
    queryKey,
    queryFn: () => applicationService.list({ ...queryFilter, pageSize: 20, page }),
  });
  const applications = appsData?.items || [];
  const totalPages = appsData?.totalPages || 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            {isEmployer ? "Received Applications" : "My Applications"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {appsData?.total || 0} total application{(appsData?.total || 0) !== 1 ? "s" : ""}
          </p>
        </div>
        {!isEmployer && (
          <Link to="/jobs">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-5 h-9 text-sm font-medium">
              <Briefcase className="w-4 h-4 mr-2" />Browse Jobs
            </Button>
          </Link>
        )}
      </div>

      {isEmployer ? (
        <ApplicationList applications={applications} userEmail={user.email} />
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Send className="w-6 h-6 text-muted-foreground/25" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">No applications yet</h3>
          <p className="text-sm text-muted-foreground mb-5">Start exploring and submit your first application.</p>
          <Link to="/jobs">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-10 font-medium">
              Browse Jobs
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
          {applications.map((app) => {
            const config = statusConfig[app.status] || statusConfig.submitted;
            return (
              <Link
                key={app.id}
                to={`/dashboard/applications/${app.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group"
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
                <div className="hidden sm:block text-right mr-2">
                  <p className="text-[0.65rem] text-muted-foreground uppercase font-medium">Applied</p>
                  <p className="text-xs font-medium text-foreground">{new Date(app.createdAt).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</p>
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

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
