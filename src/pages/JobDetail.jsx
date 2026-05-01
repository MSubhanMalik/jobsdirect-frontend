import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import authService from "@/services/auth";
import jobService from "@/services/job";
import employeeService from "@/services/employee";
import applicationService from "@/services/application";
import cvService from "@/services/cv";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LOCATION_OPTIONS } from "@/lib/siteSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import {
  MapPin, Clock, Building2, Euro, ArrowLeft, Share2, Star,
  Calendar, Briefcase, Send, CheckCircle, Upload, FileText, Bookmark
} from "lucide-react";
import savedJobService from "@/services/savedJob";

const jobTypeLabels = {
  full_time: "Full Time", part_time: "Part Time", contract: "Contract",
  temporary: "Temporary", internship: "Internship", remote: "Remote",
};
const categoryLabels = {
  technology: "Technology", healthcare: "Healthcare", finance: "Finance",
  education: "Education", engineering: "Engineering", sales: "Sales",
  marketing: "Marketing", hospitality: "Hospitality", retail: "Retail",
  construction: "Construction", transport: "Transport", admin: "Admin",
  legal: "Legal", manufacturing: "Manufacturing", other: "Other",
};

export default function JobDetail() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [showApply, setShowApply] = useState(false);
  const [showGuestApply, setShowGuestApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [consent, setConsent] = useState(false);
  const [userCVs, setUserCVs] = useState([]);
  const [selectedCV, setSelectedCV] = useState("");
  const [guestForm, setGuestForm] = useState({ name: "", email: "", phone: "", county: "", message: "", consent: false });
  const [guestFile, setGuestFile] = useState(null);
  const [saved, setSaved] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobService.getById(jobId),
    enabled: !!jobId,
  });

  useEffect(() => {
    authService.isAuthenticated().then(async (authed) => {
      if (authed) {
        const me = await authService.getUserInfo();
        setUser(me);
        const empData = await employeeService.list({ user_email: me.email });
        const emps = empData?.items || [];
        if (emps.length > 0) setEmployee(emps[0]);
        // Load user CVs and check saved status
        cvService.list().then(setUserCVs).catch(() => {});
        if (jobId) {
          const appData = await applicationService.list({ job_id: jobId, employee_email: me.email });
          const apps = appData?.items || [];
          if (apps.length > 0) setApplied(true);
          savedJobService.check(jobId).then((res) => setSaved(res.saved)).catch(() => {});
        }
      }
    });
  }, [jobId]);

  const handleApply = async () => {
    if (!user) {
      authService.redirectToLogin(window.location.pathname);
      return;
    }
    if (!employee) {
      toast.error("Complete Your Profile — Please set up your employee profile first.");
      navigate("/dashboard");
      return;
    }
    setApplying(true);
    await applicationService.create({
      job_id: job.id,
      job_title: job.title,
      employee_id: employee.id,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      employee_email: user.email,
      employer_email: job.created_by,
      company_name: job.company_name,
      cover_letter: coverLetter,
      cv_id: selectedCV !== "none" ? selectedCV : null,
      status: "submitted",
    });
    setApplying(false);
    setApplied(true);
    setShowApply(false);
    toast.success("Application Submitted! Your application has been sent to the employer.");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-5 w-1/3 mb-8" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
        <Link to="/jobs"><Button>Back to Jobs</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" className="text-primary-foreground/60 hover:text-primary-foreground mb-4 -ml-3" onClick={() => navigate("/jobs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
          <div className="flex items-start justify-between gap-4">
            <div>
              {job.is_featured && (
                <span className="inline-flex items-center gap-1 text-accent text-xs font-semibold mb-2">
                  <Star className="w-3.5 h-3.5 fill-accent" />
                  FEATURED
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <Building2 className="w-4 h-4" />
                <span>{job.company_name}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-0">
              <MapPin className="w-3 h-3 mr-1" />
              {job.location}
            </Badge>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-0">
              <Clock className="w-3 h-3 mr-1" />
              {jobTypeLabels[job.job_type]}
            </Badge>
            <Badge className="bg-primary-foreground/10 text-primary-foreground border-0">
              <Briefcase className="w-3 h-3 mr-1" />
              {categoryLabels[job.category]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Job Description</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </div>
              </CardContent>
            </Card>
            {job.benefits && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Benefits</h2>
                  <p className="text-muted-foreground">{job.benefits}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                {applied ? (
                  <Button className="w-full bg-accent/20 text-accent" disabled>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Applied
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                    onClick={() => {
                      if (!user) { setShowGuestApply(true); return; }
                      setShowApply(true);
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                )}
                {user && (
                  <Button
                    variant="outline"
                    className={`w-full ${saved ? "border-accent text-accent" : ""}`}
                    onClick={async () => {
                      const result = await savedJobService.toggle(jobId);
                      setSaved(result.saved);
                      toast.success(result.saved ? "Job saved" : "Job removed from saved");
                    }}
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${saved ? "fill-accent" : ""}`} />
                    {saved ? "Saved" : "Save Job"}
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link Copied — Job link copied to clipboard.");
                }}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Job
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold text-sm">Job Details</h3>
                {(job.salary_min || job.salary_max) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Euro className="w-4 h-4 text-muted-foreground" />
                    <span>€{job.salary_min?.toLocaleString()}{job.salary_max ? ` - €${job.salary_max.toLocaleString()}` : "+"} / {job.salary_period || "annual"}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{jobTypeLabels[job.job_type]}</span>
                </div>
                {job.expires_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Expires: {new Date(job.expires_at).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to {job.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {employee && (
              <p className="text-sm text-muted-foreground">
                Applying as <span className="font-medium text-foreground">{employee.first_name} {employee.last_name}</span>
              </p>
            )}
            {userCVs.length > 0 && (
              <div className="space-y-1">
                <Label>Attach CV</Label>
                <Select value={selectedCV} onValueChange={setSelectedCV}>
                  <SelectTrigger><SelectValue placeholder="Select a CV (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No CV attached</SelectItem>
                    {userCVs.map((cv) => (
                      <SelectItem key={cv.id} value={cv.id}>{cv.name}{cv.isDefault ? " (Default)" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Textarea
              placeholder="Cover letter (optional)"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[120px]"
            />
            <label className="flex items-start gap-2 cursor-pointer">
              <Checkbox checked={consent} onCheckedChange={(v) => setConsent(Boolean(v))} className="mt-0.5" />
              <span className="text-xs text-muted-foreground">I consent to my data being shared with the employer for recruitment purposes.</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApply(false)}>Cancel</Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleApply}
              disabled={applying || !consent}
            >
              {applying ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guest Apply Dialog */}
      <Dialog open={showGuestApply} onOpenChange={setShowGuestApply}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Apply — {job?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Full Name *</Label>
              <Input value={guestForm.name} onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })} placeholder="John Doe" required />
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input type="email" value={guestForm.email} onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })} placeholder="john@example.com" required />
            </div>
            <div className="space-y-1">
              <Label>Phone *</Label>
              <Input value={guestForm.phone} onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })} placeholder="+353 87 123 4567" required />
            </div>
            <div className="space-y-1">
              <Label>County</Label>
              <Select value={guestForm.county} onValueChange={(v) => setGuestForm({ ...guestForm, county: v })}>
                <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                <SelectContent>
                  {LOCATION_OPTIONS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Message (optional)</Label>
              <Textarea value={guestForm.message} onChange={(e) => setGuestForm({ ...guestForm, message: e.target.value })} placeholder="Why are you a good fit?" className="min-h-[80px]" />
            </div>
            <div className="space-y-1">
              <Label>Attach CV (PDF or Word) *</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-muted-foreground font-normal"
                  onClick={() => document.getElementById("guest-cv-upload").click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {guestFile ? guestFile.name : "Choose CV file..."}
                </Button>
                <input
                  id="guest-cv-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setGuestFile(e.target.files[0])}
                />
              </div>
              {guestFile && (
                <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> File ready to upload
                </p>
              )}
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <Checkbox checked={guestForm.consent} onCheckedChange={(v) => setGuestForm({ ...guestForm, consent: Boolean(v) })} className="mt-0.5" />
              <span className="text-xs text-muted-foreground">I consent to my data being shared with the employer for recruitment purposes.</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGuestApply(false)}>Cancel</Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={applying || !guestForm.name || !guestForm.email || !guestForm.phone || !guestForm.consent || !guestFile}
              onClick={async () => {
                setApplying(true);
                try {
                  const formData = new FormData();
                  formData.append("job_id", job.id);
                  formData.append("name", guestForm.name);
                  formData.append("email", guestForm.email);
                  formData.append("phone", guestForm.phone);
                  formData.append("county", guestForm.county);
                  formData.append("message", guestForm.message);
                  if (guestFile) formData.append("file", guestFile);

                  await applicationService.guestApply(formData);
                  setApplied(true);
                  setShowGuestApply(false);
                  toast.success("Application submitted! Create an account to track your application.");
                } catch (err) {
                  toast.error(err.message || "Could not submit application.");
                } finally {
                  setApplying(false);
                }
              }}
            >
              {applying ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}