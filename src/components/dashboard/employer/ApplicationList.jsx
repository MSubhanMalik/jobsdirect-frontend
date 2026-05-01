import React from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, Mail, Phone, Star, XCircle, ChevronRight, MoreHorizontal } from "lucide-react";
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

const statusConfig = {
  submitted: { dot: "bg-blue-500", label: "Submitted" },
  viewed: { dot: "bg-purple-500", label: "Viewed" },
  shortlisted: { dot: "bg-emerald-500", label: "Shortlisted" },
  contacted: { dot: "bg-amber-500", label: "Contacted" },
  interview: { dot: "bg-indigo-500", label: "Interview" },
  hired: { dot: "bg-green-600", label: "Hired" },
  rejected: { dot: "bg-red-500", label: "Rejected" },
};

export default function ApplicationList({ applications, userEmail }) {
  const queryClient = useQueryClient();

  const handleStatusChange = async (id, newStatus) => {
    try {
      await applicationService.update(id, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["employer-applications", userEmail] });
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Users className="w-6 h-6 text-muted-foreground/25" />
        </div>
        <h3 className="font-display font-semibold text-foreground mb-1">No applications received</h3>
        <p className="text-sm text-muted-foreground">Applications will appear here when candidates apply to your jobs.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
      {applications.map((app) => {
        const config = statusConfig[app.status] || statusConfig.submitted;
        return (
          <div key={app.id} className="px-5 py-4 hover:bg-muted/20 transition-colors group">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <span className="text-sm font-display font-bold text-muted-foreground">
                  {(app.employee_name || "C")[0].toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Link
                    to={`/dashboard/applications/${app.id}`}
                    className="text-sm font-semibold text-foreground hover:text-accent transition-colors truncate"
                  >
                    {app.employee_name}
                  </Link>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
                  <span className="text-[0.65rem] font-medium text-muted-foreground">{config.label}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  Applied for <span className="font-medium text-foreground/70">{app.job_title}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Quick status buttons */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs rounded-lg text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                  onClick={() => handleStatusChange(app.id, "shortlisted")}
                  disabled={app.status === "shortlisted"}
                >
                  <Star className="w-3 h-3 mr-1" /> Shortlist
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleStatusChange(app.id, "rejected")}
                  disabled={app.status === "rejected"}
                >
                  <XCircle className="w-3 h-3 mr-1" /> Reject
                </Button>

                {/* Status dropdown */}
                <Select
                  value={app.status || "submitted"}
                  onValueChange={(val) => handleStatusChange(app.id, val)}
                >
                  <SelectTrigger className="h-8 w-8 p-0 border-0 shadow-none focus:ring-0 rounded-lg [&>svg]:hidden">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {APPLICATION_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Contact icons */}
                <a
                  href={`mailto:${app.employee_email}`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted/50 transition-colors"
                  title="Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
                {app.guestPhone && (
                  <a
                    href={`tel:${app.guestPhone}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted/50 transition-colors"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* View detail */}
                <Link to={`/dashboard/applications/${app.id}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-border group-hover:text-muted-foreground transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
