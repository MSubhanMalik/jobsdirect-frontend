import React from "react";
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
import { StatusBadge, SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatSalary } from "../shared/helpers";
import { queryKeys } from "../shared/constants";

const JOB_STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "approved", label: "Approved" },
  { value: "pending_review", label: "Pending Review" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export default function AdminJobs({
  jobs,
  employers,
  search,
  setSearch,
  jobStatus,
  setJobStatus,
  openEditor,
  updateEntity,
  setDeleteDialog,
}) {
  let filtered = searchRecords(jobs, search, ["title", "company_name", "location"]);
  if (jobStatus && jobStatus !== "all") {
    filtered = filtered.filter((job) => job.status === jobStatus);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Jobs CMS"
        action={
          <Button onClick={() => openEditor("job")}>
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
            onChange={(e) => setSearch(e.target.value)}
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
                <TableHead>Placement</TableHead>
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
                    <div className="flex gap-1">
                      {job.is_featured && (
                        <Badge variant="secondary" className="text-xs">Featured</Badge>
                      )}
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
                        <DropdownMenuItem onClick={() => openEditor("job", job)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateEntity("Job", job.id, { status: "approved" }, [queryKeys.jobs], "Job approved")
                          }
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateEntity("Job", job.id, { status: "rejected" }, [queryKeys.jobs], "Job rejected")
                          }
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateEntity("Job", job.id, { status: "archived" }, [queryKeys.jobs], "Job archived")
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteDialog({ entity: "Job", id: job.id, label: job.title, keys: [queryKeys.jobs] })}
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
    </div>
  );
}
