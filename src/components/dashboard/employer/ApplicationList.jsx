import React from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Mail, Phone, CheckCircle, XCircle, Star, Eye } from "lucide-react";
import applicationService from "@/services/application";

const APPLICATION_STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "viewed", label: "Viewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "contacted", label: "Contacted" },
  { value: "interview", label: "Interview" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

const statusColors = {
  submitted: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800",
  shortlisted: "bg-emerald-100 text-emerald-800",
  contacted: "bg-amber-100 text-amber-800",
  interview: "bg-indigo-100 text-indigo-800",
  hired: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function ApplicationList({ applications, userEmail }) {
  const queryClient = useQueryClient();

  const handleStatusChange = async (id, newStatus) => {
    try {
      await applicationService.update(id, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["employer-applications", userEmail] });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No applications received yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="py-4">Candidate</TableHead>
            <TableHead>Applied For</TableHead>
            <TableHead>Current Status</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead className="text-right">Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="py-4">
                <Link to={`/dashboard/applications/${app.id}`} className="flex flex-col group">
                  <span className="font-bold text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                    {app.employee_name}
                    <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="text-xs text-muted-foreground">{app.employee_email}</span>
                </Link>
              </TableCell>
              <TableCell className="text-sm font-medium">
                {app.job_title}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={`${statusColors[app.status || "submitted"]} border-none font-medium text-[10px]`}>
                  {(app.status || "submitted").toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200"
                    onClick={() => handleStatusChange(app.id, "shortlisted")}
                    disabled={app.status === "shortlisted"}
                  >
                    <Star className="w-3 h-3 mr-1" /> Shortlist
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                    onClick={() => handleStatusChange(app.id, "rejected")}
                    disabled={app.status === "rejected"}
                  >
                    <XCircle className="w-3 h-3 mr-1" /> Reject
                  </Button>
                  <Select
                    value={app.status || "submitted"}
                    onValueChange={(val) => handleStatusChange(app.id, val)}
                  >
                    <SelectTrigger className="h-8 w-28 text-xs">
                      <SelectValue placeholder="More..." />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <a
                    href={`mailto:${app.employee_email}`}
                    className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-primary"
                    title="Email Candidate"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  {app.guestPhone && (
                    <a
                      href={`tel:${app.guestPhone}`}
                      className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-primary"
                      title="Call Candidate"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {app.coverLetter && (
                    <button
                      className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-primary"
                      title="View Cover Letter"
                      onClick={() => toast.info(
                        <div className="text-sm">
                          <p className="font-bold mb-1">Cover Letter:</p>
                          <p className="whitespace-pre-wrap">{app.coverLetter}</p>
                        </div>,
                        { autoClose: false, closeOnClick: false }
                      )}
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
