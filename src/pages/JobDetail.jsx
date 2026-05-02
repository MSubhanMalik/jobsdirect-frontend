import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import authService from "@/services/auth";
import jobService from "@/services/job";
import employeeService from "@/services/employee";
import employerService from "@/services/employer";
import applicationService from "@/services/application";
import cvService from "@/services/cv";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PhoneField from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LOCATION_OPTIONS } from "@/lib/siteSettings";
import SearchableSelect from "@/components/ui/searchable-select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  MapPin, Clock, Building2, Euro, ArrowLeft, Share2, Star,
  Calendar, Briefcase, Send, CheckCircle, Upload, FileText, Bookmark,
  ArrowUpRight, Loader2, Sparkles, AlertTriangle
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
const contractTypeLabels = {
  permanent_full_time: "Permanent full-time", permanent_part_time: "Permanent part-time",
  fixed_term: "Fixed term", temporary: "Temporary", contract: "Contract", internship: "Internship",
};
const careerLevelLabels = {
  not_required: "Not required", entry_level: "Entry level", junior: "Junior",
  mid_level: "Mid level", senior: "Senior", manager: "Manager",
  director: "Director", executive: "Executive",
};
const remoteModeLabels = {
  on_site: "On-site", hybrid: "Hybrid", remote: "Remote", blended: "Blended",
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
  const [isEmployer, setIsEmployer] = useState(false);
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
        const emplrData = await employerService.list({ user_email: me.email }).catch(() => ({ items: [] }));
        if ((emplrData?.items || []).length > 0) setIsEmployer(true);
        cvService.list().then((data) => {
          const cvs = Array.isArray(data?.cvs) ? data.cvs : (Array.isArray(data) ? data : []);
          setUserCVs(cvs);
          // Auto-select default CV, or the only CV, or the most recent
          const defaultCv = cvs.find((c) => c.is_default) || cvs[0];
          if (defaultCv) setSelectedCV(defaultCv.id);
        }).catch(() => {});
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
      <div className="min-h-screen bg-background">
        <div className="bg-muted/40 border-b border-border/50 pt-8 pb-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-4 w-24 mb-6" />
            <Skeleton className="h-8 w-2/3 mb-3" />
            <Skeleton className="h-5 w-1/3 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <Briefcase className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <h2 className="text-xl font-display font-bold mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-6">This listing may have been removed or expired.</p>
          <Link to="/jobs">
            <Button className="rounded-full px-6">Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasSalary = job.salary_mode !== "not_specified" && (job.salary_min || job.salary_max);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <div className="relative bg-muted/40 border-b border-border/50 pt-8 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button
              onClick={() => navigate("/jobs")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Jobs
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Badges row */}
            <div className="flex items-center gap-2 mb-3">
              {job.is_featured && (
                <span className="inline-flex items-center gap-1 text-accent text-xs font-semibold uppercase tracking-wider">
                  <Star className="w-3 h-3 fill-accent" />
                  Featured
                </span>
              )}
              {job.is_urgent && (
                <span className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold uppercase tracking-wider">
                  <AlertTriangle className="w-3 h-3" />
                  Urgent
                </span>
              )}
              {job.is_highlighted && (
                <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  Highlighted
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight mb-2">
              {job.title}
            </h1>

            {/* Company */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-card border border-border/60 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">{job.company_name}</span>
                {job.employer_slug && (
                  <Link to={`/employers/${job.employer_slug}`} className="text-xs text-accent ml-2 hover:underline">
                    View Company
                  </Link>
                )}
              </div>
            </div>

            {/* Meta tags */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs font-medium rounded-full px-3 py-1">
                <MapPin className="w-3 h-3 mr-1.5" />
                {job.location}
              </Badge>
              <Badge variant="secondary" className="text-xs font-medium rounded-full px-3 py-1">
                <Clock className="w-3 h-3 mr-1.5" />
                {jobTypeLabels[job.job_type] || job.job_type}
              </Badge>
              {job.contract_type && (
                <Badge variant="secondary" className="text-xs font-medium rounded-full px-3 py-1">
                  <FileText className="w-3 h-3 mr-1.5" />
                  {contractTypeLabels[job.contract_type] || job.contract_type}
                </Badge>
              )}
              {job.category && (
                <Badge variant="secondary" className="text-xs font-medium rounded-full px-3 py-1">
                  <Briefcase className="w-3 h-3 mr-1.5" />
                  {categoryLabels[job.category] || job.category}
                </Badge>
              )}
              {job.career_level && job.career_level !== "not_required" && (
                <Badge variant="secondary" className="text-xs font-medium rounded-full px-3 py-1">
                  <ArrowUpRight className="w-3 h-3 mr-1.5" />
                  {careerLevelLabels[job.career_level] || job.career_level}
                </Badge>
              )}
              {hasSalary && (
                <Badge className="bg-accent/10 text-accent border-0 text-xs font-semibold rounded-full px-3 py-1">
                  <Euro className="w-3 h-3 mr-1" />
                  {job.salary_min && `€${job.salary_min.toLocaleString()}`}
                  {job.salary_max ? ` – €${job.salary_max.toLocaleString()}` : (job.salary_min ? "+" : "")}
                  {job.salary_period && <span className="font-normal ml-1">/{job.salary_period}</span>}
                </Badge>
              )}
              {job.cv_required && (
                <Badge variant="outline" className="text-xs font-medium rounded-full px-3 py-1 border-accent/30 text-accent">
                  <FileText className="w-3 h-3 mr-1.5" />
                  CV Required
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Description */}
            <div>
              {job.short_description && (
                <p className="text-lg text-foreground font-medium mb-6 border-l-4 border-accent pl-4 py-1 italic">
                  {job.short_description}
                </p>
              )}
              <h2 className="text-base font-display font-semibold text-foreground mb-4">Job Description</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {job.benefits && (
              <div className="pt-6 border-t border-border/40">
                <h2 className="text-base font-display font-semibold text-foreground mb-4">Benefits</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{job.benefits}</p>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            {/* Action card */}
            <div className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
              {applied ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Application Submitted</p>
                    <p className="text-xs text-emerald-700 mt-0.5">The employer will review your application.</p>
                  </div>
                </div>
              ) : user && user.email === job.created_by ? (
                <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center">
                  <p className="text-sm text-muted-foreground">This is your listing</p>
                </div>
              ) : user && isEmployer ? (
                <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Employer accounts cannot apply to jobs</p>
                </div>
              ) : (
                <>
                  <Button
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-12 text-[0.95rem]"
                    onClick={() => {
                      if (!user) { setShowGuestApply(true); return; }
                      setShowApply(true);
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                  {!user && (
                    <div className="mt-3 space-y-2">
                      <a
                        href={`/auth?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`}
                        className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-foreground/20 text-sm font-semibold text-foreground hover:bg-foreground hover:text-background transition-colors"
                      >
                        Sign in to apply & track
                      </a>
                      <p className="text-center text-xs text-muted-foreground">
                        No account? <button type="button" onClick={() => setShowGuestApply(true)} className="text-muted-foreground hover:text-foreground underline">apply as guest</button>
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2">
                {user && (
                  <Button
                    variant="outline"
                    className={`flex-1 rounded-xl h-10 ${saved ? "border-accent text-accent" : ""}`}
                    onClick={async () => {
                      const result = await savedJobService.toggle(jobId);
                      setSaved(result.saved);
                      toast.success(result.saved ? "Job saved" : "Removed from saved");
                    }}
                  >
                    <Bookmark className={`w-4 h-4 mr-1.5 ${saved ? "fill-accent" : ""}`} />
                    {saved ? "Saved" : "Save"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className={`${user ? "" : "flex-1"} rounded-xl h-10`}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard");
                  }}
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  Share
                </Button>
              </div>
            </div>

            {/* Details card */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4">Job Details</h3>
              <div className="space-y-4">
                {hasSalary && (
                  <div className="flex items-start gap-3">
                    <Euro className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {job.salary_min && `€${job.salary_min.toLocaleString()}`}
                        {job.salary_max ? ` – €${job.salary_max.toLocaleString()}` : (job.salary_min ? "+" : "")}
                      </p>
                      <p className="text-xs text-muted-foreground">per {job.salary_period || "year"}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{job.location}</p>
                    <p className="text-xs text-muted-foreground">Location</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{jobTypeLabels[job.job_type] || job.job_type}</p>
                    {job.hours_per_week && <p className="text-sm text-foreground mt-0.5">{job.hours_per_week} hours/week</p>}
                    <p className="text-xs text-muted-foreground">Employment type</p>
                  </div>
                </div>
                {job.contract_type && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{contractTypeLabels[job.contract_type] || job.contract_type}</p>
                      <p className="text-xs text-muted-foreground">Contract type</p>
                    </div>
                  </div>
                )}
                {job.remote_work_mode && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{remoteModeLabels[job.remote_work_mode] || job.remote_work_mode}</p>
                      <p className="text-xs text-muted-foreground">Work mode</p>
                    </div>
                  </div>
                )}
                {job.category && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{categoryLabels[job.category] || job.category}</p>
                      <p className="text-xs text-muted-foreground">Category</p>
                    </div>
                  </div>
                )}
                {job.sector && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{job.sector}</p>
                      <p className="text-xs text-muted-foreground">Sector</p>
                    </div>
                  </div>
                )}
                {job.branch_name && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{job.branch_name}</p>
                      <p className="text-xs text-muted-foreground">Hiring Team / Branch</p>
                    </div>
                  </div>
                )}
                {job.career_level && job.career_level !== "not_required" && (
                  <div className="flex items-start gap-3">
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{careerLevelLabels[job.career_level] || job.career_level}</p>
                      <p className="text-xs text-muted-foreground">Career level</p>
                    </div>
                  </div>
                )}
                {job.positions_count > 1 && (
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{job.positions_count} positions</p>
                      <p className="text-xs text-muted-foreground">Available roles</p>
                    </div>
                  </div>
                )}
                {job.job_start_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{new Date(job.job_start_date).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}</p>
                      <p className="text-xs text-muted-foreground">Start date</p>
                    </div>
                  </div>
                )}
                {job.expires_at && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{new Date(job.expires_at).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}</p>
                      <p className="text-xs text-muted-foreground">Closing date</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company link */}
            {job.employer_slug && (
              <Link to={`/employers/${job.employer_slug}`}>
                <div className="rounded-xl border border-border/50 bg-card p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{job.company_name}</p>
                    <p className="text-xs text-muted-foreground">View company profile</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-accent transition-colors" />
                </div>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Apply Dialog ── */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent className="p-0 overflow-hidden border-none max-w-lg">
          <div className="bg-gradient-to-br from-accent/10 via-background to-background p-6 border-b border-border/50">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-display font-bold text-foreground">Apply to Role</DialogTitle>
                  <p className="text-xs text-muted-foreground truncate max-w-[300px]">{job.title}</p>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {employee && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                  {employee.first_name?.[0]}{employee.last_name?.[0]}
                </div>
                <p className="text-sm font-medium text-foreground">
                  Applying as <span className="text-accent">{employee.first_name} {employee.last_name}</span>
                </p>
              </div>
            )}

            {userCVs.length > 0 && (
              <div className="space-y-2">
                <Label className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted-foreground">Select Resume</Label>
                <Select value={selectedCV} onValueChange={setSelectedCV}>
                  <SelectTrigger className="h-12 rounded-xl border-border/60 focus:ring-accent/20">
                    <SelectValue placeholder="Choose a CV from your profile" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/60">
                    <SelectItem value="none" className="rounded-lg">No CV attached (Not recommended)</SelectItem>
                    {userCVs.map((cv) => (
                      <SelectItem key={cv.id} value={cv.id} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{cv.name}</span>
                          {cv.is_default && <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 h-4">Default</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted-foreground">Cover Letter</Label>
                <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">Optional</span>
              </div>
              <Textarea
                placeholder="Briefly explain why you're a great match for this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-[140px] rounded-xl border-border/60 focus:ring-accent/20 resize-none transition-all focus:border-accent/50"
              />
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-muted/20">
              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox 
                  checked={consent} 
                  onCheckedChange={(v) => setConsent(Boolean(v))} 
                  className="mt-1 border-muted-foreground/30 data-[state=checked]:bg-accent data-[state=checked]:border-accent transition-colors" 
                />
                <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                  I consent to my application data, including my profile details and attached CV, being shared with <span className="font-semibold text-foreground">{job.company_name}</span> for recruitment purposes.
                </span>
              </label>
            </div>
          </div>

          <div className="p-6 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setShowApply(false)} 
              className="flex-1 rounded-xl h-12 font-medium hover:bg-background transition-all"
            >
              Cancel
            </Button>
            <Button
              className="flex-[2] bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-12 font-bold shadow-lg shadow-accent/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
              onClick={handleApply}
              disabled={applying || !consent}
            >
              {applying ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" />Submit Application</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Guest Apply Dialog ── */}
      <Dialog open={showGuestApply} onOpenChange={setShowGuestApply}>
        <DialogContent className="p-0 overflow-hidden border-none max-w-xl">
          <div className="bg-gradient-to-br from-accent/10 via-background to-background p-6 border-b border-border/50">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-display font-bold text-foreground">Quick Apply</DialogTitle>
                  <p className="text-xs text-muted-foreground truncate max-w-[350px]">{job?.title}</p>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</Label>
                <Input 
                  value={guestForm.name} 
                  onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })} 
                  placeholder="John Doe" 
                  className="h-12 rounded-xl border-border/60 focus:ring-accent/20 focus:border-accent/50 transition-all" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted-foreground">Email Address *</Label>
                <Input 
                  type="email" 
                  value={guestForm.email} 
                  onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })} 
                  placeholder="john@example.com" 
                  className="h-12 rounded-xl border-border/60 focus:ring-accent/20 focus:border-accent/50 transition-all" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted-foreground">Phone Number *</Label>
                <PhoneField
                  value={guestForm.phone}
                  onChange={(val) => setGuestForm({ ...guestForm, phone: val })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted-foreground">County</Label>
                <SearchableSelect
                  options={LOCATION_OPTIONS}
                  value={guestForm.county || ""}
                  onValueChange={(v) => setGuestForm({ ...guestForm, county: v })}
                  placeholder="Select county"
                  searchPlaceholder="Search county..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted-foreground">Message</Label>
                <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">Optional</span>
              </div>
              <Textarea 
                value={guestForm.message} 
                onChange={(e) => setGuestForm({ ...guestForm, message: e.target.value })} 
                placeholder="Why are you a good fit for this role?" 
                className="min-h-[100px] rounded-xl border-border/60 focus:ring-accent/20 focus:border-accent/50 transition-all resize-none" 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[0.8rem] font-semibold uppercase tracking-wider text-muted-foreground">Attach CV *</Label>
              <div 
                className={`group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                  guestFile 
                  ? "bg-emerald-50/30 border-emerald-500/50" 
                  : "bg-muted/30 border-border/60 hover:bg-muted/50 hover:border-accent/40"
                }`}
                onClick={() => document.getElementById("guest-cv-upload").click()}
              >
                {guestFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-800">{guestFile.name}</p>
                    <p className="text-[10px] text-emerald-600 mt-1 uppercase font-bold tracking-tight">File Ready to upload</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 h-7 text-[10px] text-muted-foreground hover:text-red-500 hover:bg-transparent"
                      onClick={(e) => { e.stopPropagation(); setGuestFile(null); }}
                    >
                      Remove and change
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground/40 group-hover:text-accent/60 mb-2 transition-colors" />
                    <p className="text-sm font-medium text-foreground">Click to upload your CV</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF or Word documents accepted</p>
                  </>
                )}
              </div>
              <input
                id="guest-cv-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setGuestFile(e.target.files[0])}
              />
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-muted/20">
              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox 
                  checked={guestForm.consent} 
                  onCheckedChange={(v) => setGuestForm({ ...guestForm, consent: Boolean(v) })} 
                  className="mt-1 border-muted-foreground/30 data-[state=checked]:bg-accent data-[state=checked]:border-accent transition-colors" 
                />
                <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                  I consent to my application data being shared with <span className="font-semibold text-foreground">{job?.company_name || "the employer"}</span> for recruitment purposes.
                </span>
              </label>
            </div>
          </div>

          <div className="p-6 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setShowGuestApply(false)} 
              className="flex-1 rounded-xl h-12 font-medium hover:bg-background transition-all"
            >
              Cancel
            </Button>
            <Button
              className="flex-[2] bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-12 font-bold shadow-lg shadow-accent/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
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
                  toast.success("Application submitted! Create an account to track it.");
                } catch (err) {
                  toast.error(err.message || "Could not submit application.");
                } finally {
                  setApplying(false);
                }
              }}
            >
              {applying ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" />Submit Application</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
