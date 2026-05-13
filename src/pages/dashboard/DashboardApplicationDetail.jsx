import React, { useState } from "react";
import { useParams, useNavigate, useOutletContext, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import applicationService from "@/services/application";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import {
  FileText, Download, Clock, MapPin, Mail, Phone,
  CheckCircle, XCircle, Star, MessageSquare, ArrowLeft, ExternalLink,
  Calendar, User, Briefcase, Send, Loader2, AlertCircle, Video, MapPinned, Info
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function DashboardApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isEmployer, user, employer } = useOutletContext();
  const [updating, setUpdating] = useState(false);
  const [showAskInfo, setShowAskInfo] = useState(false);
  const [askInfoMessage, setAskInfoMessage] = useState("");
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    interview_date: "", interview_time: "", interview_type: "physical",
    interview_location: "", interview_meeting_link: "", interview_notes: "",
  });

  const { data: app, isLoading, error } = useQuery({
    queryKey: ["application", id],
    queryFn: () => applicationService.getById(id),
    enabled: !!id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["application", id] });
    queryClient.invalidateQueries({ queryKey: ["employer-applications", user.email] });
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await applicationService.update(id, { status: newStatus });
      invalidate();
      toast.success(`Status updated to ${newStatus}`);
    } catch { toast.error("Failed to update status"); }
    finally { setUpdating(false); }
  };

  const handleAskForInfo = async () => {
    if (!askInfoMessage.trim()) return;
    setUpdating(true);
    try {
      await applicationService.askForInfo(id, askInfoMessage);
      invalidate();
      setShowAskInfo(false);
      setAskInfoMessage("");
      toast.success("Information request sent to candidate");
    } catch { toast.error("Failed to send request"); }
    finally { setUpdating(false); }
  };

  const handleInviteToInterview = async () => {
    if (!interviewForm.interview_date || !interviewForm.interview_time) return;
    setUpdating(true);
    try {
      await applicationService.inviteToInterview(id, interviewForm);
      invalidate();
      setShowInterviewForm(false);
      toast.success("Interview invitation sent to candidate");
    } catch { toast.error("Failed to send interview invite"); }
    finally { setUpdating(false); }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7 text-muted-foreground/30" />
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">Application Not Found</h3>
        <p className="text-sm text-muted-foreground mb-6">This application may have been removed.</p>
        <Button onClick={() => navigate("/dashboard/applications")} variant="outline" className="rounded-full px-6">
          Back to Applications
        </Button>
      </div>
    );
  }

  const config = statusConfig[app.status] || statusConfig.submitted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard/applications")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </button>
        {isEmployer && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            <Select value={app.status || "submitted"} onValueChange={handleStatusChange} disabled={updating}>
              <SelectTrigger className="h-9 w-36 rounded-lg text-sm">
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

      {/* Candidate header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <span className="text-lg font-display font-bold text-muted-foreground">
            {(app.employee_name || "C")[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-display font-bold text-foreground">{app.employee_name}</h1>
            <span className={`w-2 h-2 rounded-full ${config.dot}`} />
            <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
          </div>
          <p className="text-sm text-muted-foreground">{app.employee_email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cover Letter */}
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border/40">
              <h2 className="text-base font-display font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" /> Cover Letter
              </h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {app.cover_letter || "No cover letter provided."}
              </p>
            </div>
          </div>

          {/* CV & Documents */}
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border/40">
              <h2 className="text-base font-display font-semibold text-foreground flex items-center gap-2">
                <Download className="w-4 h-4 text-muted-foreground" /> CV & Documents
              </h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              {app.documents?.length > 0 ? (
                app.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-muted/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-accent/[0.08] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.name || "Document"}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.file_name || doc.name}{doc.file_size ? ` · ${Math.round(doc.file_size / 1024)} KB` : ""}
                        </p>
                      </div>
                    </div>
                    {doc.file_url ? (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg h-8 text-xs font-medium">
                          <Download className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">No file</span>
                    )}
                  </div>
                ))
              ) : app.cv_url ? (
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-muted/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-accent/[0.08] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">Candidate CV</p>
                      <p className="text-xs text-muted-foreground">Submitted with application</p>
                    </div>
                  </div>
                  <a href={app.cv_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg h-8 text-xs font-medium">
                      <Download className="w-3.5 h-3.5 mr-1" /> View CV
                    </Button>
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No CV or documents submitted with this application.</p>
              )}
            </div>
          </div>

          {/* Position */}
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{app.job_title}</p>
                  <p className="text-xs text-muted-foreground">{app.company_name}{app.job?.location ? ` · ${app.job.location}` : ""}</p>
                </div>
              </div>
              <Link to={`/jobs/${app.job_id}`}>
                <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs font-medium">
                  View Job <ExternalLink className="w-3 h-3 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Interview details — shown if scheduled */}
          {app.interview_date && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-emerald-200">
                <h2 className="text-base font-display font-semibold text-emerald-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Interview Scheduled
                </h2>
              </div>
              <div className="px-6 py-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-emerald-600 font-medium">Date:</span> <span className="text-foreground">{app.interview_date}</span></div>
                <div><span className="text-emerald-600 font-medium">Time:</span> <span className="text-foreground">{app.interview_time}</span></div>
                <div><span className="text-emerald-600 font-medium">Type:</span> <span className="text-foreground capitalize">{app.interview_type}</span></div>
                {app.interview_type === "physical" && app.interview_location && (
                  <div><span className="text-emerald-600 font-medium">Location:</span> <span className="text-foreground">{app.interview_location}</span></div>
                )}
                {app.interview_type === "virtual" && app.interview_meeting_link && (
                  <div className="col-span-2"><span className="text-emerald-600 font-medium">Meeting Link:</span>{" "}
                    <a href={app.interview_meeting_link} target="_blank" rel="noopener noreferrer" className="text-accent underline">{app.interview_meeting_link}</a>
                  </div>
                )}
                {app.interview_notes && (
                  <div className="col-span-2"><span className="text-emerald-600 font-medium">Notes:</span> <span className="text-foreground">{app.interview_notes}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Employer request message — shown if asked for info */}
          {app.employer_request_message && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-6 py-3 border-b border-border/40">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Info className="w-4 h-4 text-muted-foreground" /> Information Requested
                </h2>
              </div>
              <div className="px-6 py-4 text-sm text-muted-foreground">{app.employer_request_message}</div>
            </div>
          )}

          {/* Employer actions — structured per §12 */}
          {isEmployer && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="text-base font-display font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" /> Actions
                </h2>
              </div>
              <div className="px-6 py-5 space-y-4">
                {/* Ask for Info */}
                {!showAskInfo && !showInterviewForm && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="rounded-lg h-9 text-xs font-medium bg-foreground hover:bg-foreground/90 text-background" onClick={() => handleStatusChange("shortlisted")} disabled={app.status === "shortlisted" || updating}>
                      <Star className="w-3.5 h-3.5 mr-1.5" /> Shortlist
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg h-9 text-xs font-medium" onClick={() => setShowAskInfo(true)} disabled={updating}>
                      <Info className="w-3.5 h-3.5 mr-1.5" /> Ask for Info
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg h-9 text-xs font-medium" onClick={() => setShowInterviewForm(true)} disabled={updating}>
                      <Calendar className="w-3.5 h-3.5 mr-1.5" /> Invite to Interview
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-lg h-9 text-xs font-medium text-destructive hover:text-destructive" onClick={() => handleStatusChange("rejected")} disabled={app.status === "rejected" || updating}>
                      <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                    </Button>
                  </div>
                )}

                {/* Ask for Info Form */}
                {showAskInfo && (
                  <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                    <p className="text-sm font-semibold text-foreground">Request Information</p>
                    <textarea
                      value={askInfoMessage}
                      onChange={(e) => setAskInfoMessage(e.target.value)}
                      placeholder="Describe what information you need from the candidate..."
                      className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="rounded-lg h-8 text-xs bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleAskForInfo} disabled={!askInfoMessage.trim() || updating}>
                        {updating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />} Send Request
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-lg h-8 text-xs" onClick={() => { setShowAskInfo(false); setAskInfoMessage(""); }}>Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Interview Invite Form */}
                {showInterviewForm && (
                  <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                    <p className="text-sm font-semibold text-foreground">Schedule Interview</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Date</Label>
                        <Input type="date" value={interviewForm.interview_date} onChange={(e) => setInterviewForm({ ...interviewForm, interview_date: e.target.value })} className="h-9 rounded-lg text-sm" required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Time</Label>
                        <Input type="time" value={interviewForm.interview_time} onChange={(e) => setInterviewForm({ ...interviewForm, interview_time: e.target.value })} className="h-9 rounded-lg text-sm" required />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Interview Type</Label>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant={interviewForm.interview_type === "physical" ? "default" : "outline"} className="rounded-lg h-8 text-xs flex-1" onClick={() => setInterviewForm({ ...interviewForm, interview_type: "physical", interview_meeting_link: "" })}>
                          <MapPinned className="w-3 h-3 mr-1" /> In-Person
                        </Button>
                        <Button type="button" size="sm" variant={interviewForm.interview_type === "virtual" ? "default" : "outline"} className="rounded-lg h-8 text-xs flex-1" onClick={() => setInterviewForm({ ...interviewForm, interview_type: "virtual", interview_location: "" })}>
                          <Video className="w-3 h-3 mr-1" /> Virtual
                        </Button>
                      </div>
                    </div>
                    {interviewForm.interview_type === "physical" && (
                      <div className="space-y-1">
                        <Label className="text-xs">Location</Label>
                        <Input placeholder="e.g. 123 Main Street, Dublin" value={interviewForm.interview_location} onChange={(e) => setInterviewForm({ ...interviewForm, interview_location: e.target.value })} className="h-9 rounded-lg text-sm" />
                      </div>
                    )}
                    {interviewForm.interview_type === "virtual" && (
                      <div className="space-y-1">
                        <Label className="text-xs">Meeting Link</Label>
                        <Input type="url" placeholder="https://zoom.us/j/..." value={interviewForm.interview_meeting_link} onChange={(e) => setInterviewForm({ ...interviewForm, interview_meeting_link: e.target.value })} className="h-9 rounded-lg text-sm" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs">Notes <span className="text-muted-foreground">(optional)</span></Label>
                      <textarea value={interviewForm.interview_notes} onChange={(e) => setInterviewForm({ ...interviewForm, interview_notes: e.target.value })} placeholder="Any additional details..." className="w-full min-h-[60px] px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="rounded-lg h-8 text-xs bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleInviteToInterview} disabled={!interviewForm.interview_date || !interviewForm.interview_time || updating}>
                        {updating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Calendar className="w-3 h-3 mr-1" />} Send Invitation
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-lg h-8 text-xs" onClick={() => setShowInterviewForm(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact info */}
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border/40">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Contact</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              <a href={`mailto:${app.employee_email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-accent transition-colors">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{app.employee_email}</span>
              </a>
              {(app.guest_phone || app.user?.phone) && (
                <a href={`tel:${app.guest_phone || app.user.phone}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-accent transition-colors">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{app.guest_phone || app.user.phone}</span>
                </a>
              )}
              {(app.guest_county || app.job?.location) && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{app.guest_county || app.job?.location}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Applied {new Date(app.createdAt || app.created_at).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* Status summary — employer only */}
          {isEmployer && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border/40">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                <Select value={app.status} onValueChange={handleStatusChange} disabled={updating}>
                  <SelectTrigger className="h-9 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {app.status === "interview" && app.interview_date && (
                  <p className="text-xs text-emerald-600 font-medium">Interview: {app.interview_date} at {app.interview_time}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
