import React, { useState } from "react";
import { useParams, useNavigate, useOutletContext, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import applicationService from "@/services/application";
import messageService from "@/services/message";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import {
  FileText, Download, Clock, MapPin, Mail, Phone,
  CheckCircle, XCircle, Star, MessageSquare, ArrowLeft, ExternalLink,
  Calendar, User, Briefcase, Send, Loader2, AlertCircle
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
  const [activeRoom, setActiveRoom] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { data: app, isLoading, error } = useQuery({
    queryKey: ["application", id],
    queryFn: () => applicationService.getById(id),
    enabled: !!id,
  });

  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ["application-messages", activeRoom?.id],
    queryFn: () => messageService.getMessages(activeRoom.id),
    enabled: !!activeRoom?.id,
    refetchInterval: 5000,
  });

  const handleStartChat = async () => {
    if (!app) return;
    try {
      const room = await messageService.createRoom({ applicationId: app.id });
      setActiveRoom(room);
      navigate(`/dashboard/messages/${room.id}`);
    } catch { toast.error("Failed to start chat"); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;
    setSending(true);
    try {
      await messageService.sendMessage(activeRoom.id, newMessage);
      setNewMessage("");
      refetchMessages();
    } catch { toast.error("Failed to send message"); }
    finally { setSending(false); }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await applicationService.update(id, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["employer-applications", user.email] });
      toast.success(`Status updated to ${newStatus}`);
    } catch { toast.error("Failed to update status"); }
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

          {/* Communication — employer only */}
          {isEmployer && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="text-base font-display font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" /> Communication
                </h2>
              </div>
              <div className="px-6 py-5">
                {employer?.candidate_database_status !== "cv_db_pro" && (
                  <div className="mb-5 p-4 rounded-lg border border-blue-200 bg-blue-50 flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Pro Plan Required</p>
                      <p className="text-xs text-blue-700">
                        In-platform messaging requires the Pro plan.{" "}
                        <Link to="/dashboard/billing" className="font-semibold underline">Upgrade now</Link>
                      </p>
                    </div>
                  </div>
                )}
                {!app.user_id && (
                  <div className="mb-5 p-4 rounded-lg border border-amber-200 bg-amber-50 flex items-start gap-3">
                    <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Guest Application</p>
                      <p className="text-xs text-amber-700">
                        This candidate applied as a guest. Contact via email: <span className="font-semibold">{app.employee_email}</span>
                      </p>
                    </div>
                  </div>
                )}
                {!activeRoom ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-4">Start a conversation with this candidate.</p>
                    <Button
                      onClick={handleStartChat}
                      disabled={!app.user_id || employer?.candidate_database_status !== "cv_db_pro"}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-10 font-medium"
                    >
                      <Send className="w-4 h-4 mr-2" /> Message Candidate
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
                      {(messagesData?.items || []).length === 0 ? (
                        <p className="text-center text-xs text-muted-foreground py-10">No messages yet.</p>
                      ) : (
                        messagesData.items.map((msg) => (
                          <div key={msg.id} className={`flex flex-col ${msg.sender_id === user.id ? "items-end" : "items-start"}`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] ${
                              msg.sender_id === user.id
                                ? "bg-foreground text-background rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            }`}>
                              {msg.message}
                            </div>
                            <span className="text-[0.6rem] text-muted-foreground mt-1 px-1">
                              {msg.sender?.first_name || "Candidate"} · {new Date(msg.createdAt || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-border/40">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                        disabled={sending}
                      />
                      <Button type="submit" size="sm" disabled={sending || !newMessage.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-10 px-4">
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </form>
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

          {/* Quick actions — employer only */}
          {isEmployer && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border/40">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Quick Actions</h3>
              </div>
              <div className="px-5 py-4 space-y-2">
                <Button
                  className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-lg h-9 text-xs font-medium justify-start"
                  onClick={() => handleStatusChange("shortlisted")}
                  disabled={app.status === "shortlisted" || updating}
                >
                  <Star className="w-3.5 h-3.5 mr-2" /> Shortlist Candidate
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-lg h-9 text-xs font-medium justify-start"
                  onClick={() => handleStatusChange("interview")}
                  disabled={app.status === "interview" || updating}
                >
                  <Calendar className="w-3.5 h-3.5 mr-2" /> Schedule Interview
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 rounded-lg h-9 text-xs font-medium justify-start"
                  onClick={() => handleStatusChange("rejected")}
                  disabled={app.status === "rejected" || updating}
                >
                  <XCircle className="w-3.5 h-3.5 mr-2" /> Reject Application
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
