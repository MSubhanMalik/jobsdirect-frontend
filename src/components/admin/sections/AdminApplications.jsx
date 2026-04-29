import React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatDate } from "../shared/helpers";
import { queryKeys } from "../shared/constants";

const APPLICATION_STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
];

export default function AdminApplications({ applications, search, updateEntity }) {
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
                    <Select
                      value={app.status || "submitted"}
                      onValueChange={(value) =>
                        updateEntity(
                          "Application",
                          app.id,
                          { status: value },
                          [queryKeys.applications],
                          `Application ${value}`,
                        )
                      }
                    >
                      <SelectTrigger className="h-8 w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLICATION_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
    </div>
  );
}
