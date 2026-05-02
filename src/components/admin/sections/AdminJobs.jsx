import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Pencil, CheckCircle2, XCircle, FileText, MoreHorizontal, Trash2, MapPin, Eye, ChevronRight
} from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatSalary } from "../shared/helpers";
import { queryKeys } from "../shared/constants";
import PaginationControls from "@/components/ui/pagination-controls";
import jobService from "@/services/job";
import employerService from "@/services/employer";

const JOB_STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "approved", label: "Approved" },
  { value: "pending_review", label: "Pending Review" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const statusConfig = {
  approved: { dot: "bg-emerald-500", label: "Active" },
  pending_review: { dot: "bg-amber-500", label: "Pending" },
  rejected: { dot: "bg-red-500", label: "Rejected" },
  draft: { dot: "bg-muted-foreground", label: "Draft" },
  archived: { dot: "bg-muted-foreground", label: "Archived" },
  unpaid: { dot: "bg-orange-500", label: "Unpaid" },
  expired: { dot: "bg-muted-foreground", label: "Expired" },
};

export default function AdminJobs() {
  const { search, openEditor } = useOutletContext();
  const queryClient = useQueryClient();
  const [jobStatus, setJobStatus] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [page, setPage] = useState(1);

  const jobsQuery = useQuery({ queryKey: [...queryKeys.jobs, page], queryFn: () => jobService.list({ pageSize: 20, page }) });
  const employersQuery = useQuery({ queryKey: queryKeys.employers, queryFn: () => employerService.list({ pageSize: 100 }) });

  const jobs = jobsQuery.data?.items || [];
  const totalPages = jobsQuery.data?.totalPages || 1;
  const total = jobsQuery.data?.total || 0;
  const employers = employersQuery.data?.items || [];

  const updateEntity = async (id, updates, title) => {
    try {
      await jobService.update(id, updates);
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      toast.success(title);
    } catch { toast.error("Failed to update job"); }
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    try {
      await jobService.remove(deleteDialog.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      toast.success(`Deleted — ${deleteDialog.label}`);
      setDeleteDialog(null);
    } catch { toast.error("Failed to delete job"); }
  };

  let filtered = searchRecords(jobs, search, ["title", "company_name", "location"]);
  if (jobStatus && jobStatus !== "all") {
    filtered = filtered.filter((job) => job.status === jobStatus);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Jobs CMS"
        description={`${total} total listings`}
        action={
          <Button onClick={() => openEditor("job", null, { employers })} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-5 h-9 text-sm font-medium">
            <Plus className="h-4 w-4 mr-1.5" /> New Job
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={jobStatus} onValueChange={(v) => { setJobStatus(v); setPage(1); }}>
          <SelectTrigger className="w-44 h-9 rounded-lg text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {JOB_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Job list */}
      {filtered.length === 0 ? (
        <EmptyState title="No jobs found" description="Try adjusting your search or filters." />
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
          {filtered.map((job) => {
            const config = statusConfig[job.status] || statusConfig.draft;
            return (
              <div key={job.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group">
                {/* Status dot + info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
                    <p className="text-sm font-display font-semibold text-foreground truncate">{job.title}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{job.company_name}</span>
                    {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                    {(job.salary_min || job.salary_max) && <span>{formatSalary(job)}</span>}
                  </div>
                </div>

                {/* Addons */}
                <div className="hidden md:flex items-center gap-1 shrink-0">
                  {job.is_featured && (
                    <Badge variant="secondary" className="text-[0.6rem] rounded-md px-2 py-0.5 capitalize">Featured</Badge>
                  )}
                  {job.is_highlighted && (
                    <Badge variant="secondary" className="text-[0.6rem] rounded-md px-2 py-0.5 capitalize">Highlighted</Badge>
                  )}
                  {job.is_urgent && (
                    <Badge variant="secondary" className="text-[0.6rem] rounded-md px-2 py-0.5 capitalize">Urgent</Badge>
                  )}
                  {job.is_auto_renew && (
                    <Badge variant="secondary" className="text-[0.6rem] rounded-md px-2 py-0.5 capitalize">Auto Renew</Badge>
                  )}
                </div>

                {/* Status label */}
                <span className="text-xs font-medium text-muted-foreground capitalize shrink-0 w-16 text-right">{config.label}</span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost" size="sm"
                    className="h-8 text-xs rounded-lg text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 hidden sm:flex"
                    onClick={() => updateEntity(job.id, { status: "approved" }, "Job approved")}
                    disabled={job.status === "approved"}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditor("job", job, { employers })}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateEntity(job.id, { status: "approved" }, "Job approved")}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateEntity(job.id, { status: "rejected" }, "Job rejected")}>
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateEntity(job.id, { status: "archived" }, "Job archived")}>
                        <FileText className="mr-2 h-4 w-4" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteDialog({ id: job.id, label: job.title })}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!deleteDialog}
        title="Delete this job?"
        description={deleteDialog?.label ? `"${deleteDialog.label}" will be permanently removed.` : "This job will be permanently removed."}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog(null)}
      />
    </div>
  );
}
