import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Pencil, CheckCircle2, XCircle, FileText, MoreHorizontal, Trash2, Search,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { StatusBadge, SectionHeader, EmptyState } from "../shared/UIComponents";
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
  const employers = employersQuery.data?.items || [];

  const updateEntity = async (id, updates, title) => {
    try {
      await jobService.update(id, updates);
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      toast.success(title);
    } catch (err) {
      toast.error("Failed to update job");
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    try {
      await jobService.remove(deleteDialog.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      toast.success(`Deleted — ${deleteDialog.label}`);
      setDeleteDialog(null);
    } catch (err) {
      toast.error("Failed to delete job");
    }
  };

  let filtered = searchRecords(jobs, search, ["title", "company_name", "location"]);
  if (jobStatus && jobStatus !== "all") {
    filtered = filtered.filter((job) => job.status === jobStatus);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Jobs CMS"
        action={
          <Button onClick={() => openEditor("job", null, { employers })}>
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            readOnly
            className="pl-9"
          />
        </div>
        <Select value={jobStatus} onValueChange={setJobStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {JOB_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No jobs found" description="Try adjusting your search or filters." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Addons</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.company_name}</p>
                  </TableCell>
                  <TableCell className="text-sm">{job.location || "Not set"}</TableCell>
                  <TableCell className="text-sm">{formatSalary(job)}</TableCell>
                  <TableCell>
                    <StatusBadge value={job.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {(job.active_addons || []).length > 0
                        ? job.active_addons.map((a) => (
                            <Badge key={a.id} variant={a.status === "active" ? "secondary" : "outline"} className="text-xs">
                              {a.id.replace("addon_", "").replace("_", " ")}
                            </Badge>
                          ))
                        : <span className="text-xs text-muted-foreground">None</span>
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditor("job", job, { employers })}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateEntity(job.id, { status: "approved" }, "Job approved")}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateEntity(job.id, { status: "rejected" }, "Job rejected")}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateEntity(job.id, { status: "archived" }, "Job archived")}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteDialog({ id: job.id, label: job.title })}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!deleteDialog}
        title="Delete this record?"
        description={deleteDialog?.label ? `"${deleteDialog.label}" will be removed from the CMS.` : "This record will be removed from the CMS."}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog(null)}
      />
    </div>
  );
}
