import React, { useState } from "react";
import { useParams, useNavigate, useOutletContext, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import applicationService from "@/services/application";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import {
  ArrowLeft, Mail, Phone, MapPin, FileText, Download,
  CheckCircle, XCircle, Star, User, Briefcase, Calendar
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

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

export default function DashboardApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isEmployer, user } = useOutletContext();
  const [updating, setUpdating] = useState(false);

  const { data: app, isLoading, error } = useQuery({
    queryKey: ["application", id],
    queryFn: () => applicationService.getById(id),
    enabled: !!id,
  });

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await applicationService.update(id, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["employer-applications", user.email] });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-2">Application Not Found</h2>
        <Button onClick={() => navigate("/dashboard/applications")}>Back to Applications</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/dashboard/applications")} className="-ml-3 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applications
        </Button>
        {isEmployer && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-2">Manage Status:</span>
            <Select
              value={app.status || "submitted"}
              onValueChange={handleStatusChange}
              disabled={updating}
            >
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{app.employee_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{app.employee_email}</p>
                  </div>
                </div>
                <Badge className={`${statusColors[app.status || "submitted"]} border-none px-3 py-1`}>
                  {(app.status || "submitted").toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Cover Letter
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed border">
                  {app.coverLetter || "No cover letter provided."}
                </div>
              </div>

              {app.documents && app.documents.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Attached Documents
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {app.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-emerald-600" />
                          <div>
                            <p className="text-sm font-medium text-emerald-900">{doc.name || "Document"}</p>
                            <p className="text-xs text-emerald-700">
                              {doc.fileName} {doc.fileSize ? `(${Math.round(doc.fileSize / 1024)} KB)` : ""}
                            </p>
                          </div>
                        </div>
                        <Button asChild variant="secondary" size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" /> View File
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applied For Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Position Applied For
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">{app.job_title}</p>
                  <p className="text-sm text-muted-foreground">{app.company_name} · {app.job?.location}</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/jobs/${app.jobId}`}>View Job Listing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={`mailto:${app.employee_email}`} className="hover:text-primary transition-colors truncate">
                  {app.employee_email}
                </a>
              </div>
              {(app.guestPhone || app.user?.phone) && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a href={`tel:${app.guestPhone || app.user.phone}`} className="hover:text-primary transition-colors">
                    {app.guestPhone || app.user.phone}
                  </a>
                </div>
              )}
              {(app.guestCounty || app.job?.location) && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{app.guestCounty || app.job?.location}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {isEmployer && (
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-sm">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                    onClick={() => handleStatusChange("shortlisted")}
                    disabled={app.status === "shortlisted" || updating}
                  >
                    <Star className="w-4 h-4 mr-2" /> Shortlist Candidate
                  </Button>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9"
                    onClick={() => handleStatusChange("interview")}
                    disabled={app.status === "interview" || updating}
                  >
                    <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-9"
                    onClick={() => handleStatusChange("rejected")}
                    disabled={app.status === "rejected" || updating}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
