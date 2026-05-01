import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

export default function AdminApplications() {
  const { search } = useOutletContext();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const applicationsQuery = useQuery({ queryKey: [...queryKeys.applications, page], queryFn: () => applicationService.list({ pageSize: 20, page }) });
  const applications = applicationsQuery.data?.items || [];
  const totalPages = applicationsQuery.data?.totalPages || 1;

  const updateEntity = async (id, updates, title) => {
    try {
      await applicationService.update(id, updates);
      queryClient.invalidateQueries({ queryKey: queryKeys.applications });
      toast.success(title);
    } catch (err) {
      toast.error("Failed to update application");
    }
  };

  const filtered = searchRecords(applications, search, [
    "employee_name", "employee_email", "job_title", "company_name",
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Applications" />

      {filtered.length === 0 ? (
        <EmptyState title="No applications found" description="Try adjusting your search." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <p className="font-medium">{app.employee_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{app.employee_email}</p>
                  </TableCell>
                  <TableCell className="text-sm">{app.job_title || "Untitled"}</TableCell>
                  <TableCell className="text-sm">{app.company_name || "Unknown"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {app.status || "submitted"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(app.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
