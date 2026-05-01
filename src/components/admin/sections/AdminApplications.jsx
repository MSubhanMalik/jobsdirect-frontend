import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatDate } from "../shared/helpers";
import { queryKeys } from "../shared/constants";
import PaginationControls from "@/components/ui/pagination-controls";
import applicationService from "@/services/application";

const APPLICATION_STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "viewed", label: "Viewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "contacted", label: "Contacted" },
  { value: "interview", label: "Interview" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
  { value: "closed", label: "Closed" },
];

const statusConfig = {
  submitted: { dot: "bg-blue-500" },
  viewed: { dot: "bg-purple-500" },
  shortlisted: { dot: "bg-emerald-500" },
  contacted: { dot: "bg-amber-500" },
  interview: { dot: "bg-indigo-500" },
  hired: { dot: "bg-green-600" },
  rejected: { dot: "bg-red-500" },
  closed: { dot: "bg-muted-foreground" },
};

export default function AdminApplications() {
  const { search } = useOutletContext();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const applicationsQuery = useQuery({ queryKey: [...queryKeys.applications, page], queryFn: () => applicationService.list({ pageSize: 20, page }) });
  const applications = applicationsQuery.data?.items || [];
  const totalPages = applicationsQuery.data?.totalPages || 1;
  const total = applicationsQuery.data?.total || 0;

  const updateEntity = async (id, updates, title) => {
    try {
      await applicationService.update(id, updates);
      queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      toast.success(title);
    } catch { toast.error("Failed to update application"); }
  };

  const filtered = searchRecords(applications, search, ["employee_name", "employee_email", "job_title", "company_name"]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Applications" description={`${total} total applications`} />

      {filtered.length === 0 ? (
        <EmptyState title="No applications found" description="Try adjusting your search." />
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
          {filtered.map((app) => {
            const config = statusConfig[app.status] || statusConfig.submitted;
            return (
              <Link
                key={app.id}
                to={`/admin/applications/${app.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <span className="text-sm font-display font-bold text-muted-foreground">
                    {(app.employee_name || "C")[0].toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-display font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                      {app.employee_name || "Unknown"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="truncate">{app.job_title || "Untitled"}</span>
                    <span className="hidden sm:inline">{app.company_name || "Unknown"}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Inline status change */}
                  <Select
                    value={app.status || "submitted"}
                    onValueChange={(val) => { updateEntity(app.id, { status: val }, `Status → ${val}`); }}
                  >
                    <SelectTrigger
                      className="h-7 w-28 text-[0.65rem] rounded-md border-border/40 bg-transparent"
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Date */}
                  <span className="text-[0.65rem] text-muted-foreground whitespace-nowrap hidden md:block w-20 text-right">
                    {formatDate(app.createdAt)}
                  </span>

                  <ChevronRight className="w-4 h-4 text-border group-hover:text-muted-foreground shrink-0 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
