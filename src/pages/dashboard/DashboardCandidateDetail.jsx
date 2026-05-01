import React from "react";
import { useOutletContext, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Briefcase, GraduationCap, FileText, 
  ChevronLeft, MessageSquare, Download, Lock,
  Globe, Linkedin, Github, Award, Languages
} from "lucide-react";
import employeeService from "@/services/employee";
import { toast } from "react-toastify";

export default function DashboardCandidateDetail() {
  const { id } = useParams();
  const { employer } = useOutletContext();
  
  const hasAccess = employer?.candidate_database_access || employer?.candidateDatabaseAccess;
  const hasPro = employer?.candidate_database_status === "cv_db_pro" || employer?.candidateDatabaseStatus === "cv_db_pro";

  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ["candidate-detail", id],
    queryFn: () => employeeService.getById(id),
  });

  if (isLoading) return <CandidateSkeleton />;
  if (error || !candidate) return <ErrorState />;

  const handleDownloadCV = () => {
    if (!hasAccess) {
      toast.error("Upgrade to Lite or Pro plan to download CVs.");
      return;
    }
    if (candidate.cv_url) {
      window.open(candidate.cv_url, "_blank");
    } else {
      toast.info("No CV uploaded by this candidate.");
    }
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="pl-0 hover:bg-transparent -ml-2">
        <Link to="/dashboard/cv-search">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Search
        </Link>
      </Button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Col: Main Profile */}
        <div className="flex-1 space-y-6">
          <Card className="overflow-hidden border-none shadow-sm">
            <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20" />
            <CardContent className="p-6 -mt-12">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="w-24 h-24 rounded-2xl bg-background border-4 border-background shadow-md flex items-center justify-center shrink-0 overflow-hidden">
                  {candidate.profile_photo_url ? (
                    <img src={candidate.profile_photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Briefcase className="w-10 h-10 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-12 sm:pt-14">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{candidate.user?.firstName} {candidate.user?.lastName}</h2>
                    {candidate.is_searchable && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0.5">
                        Available
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">{candidate.title || "Job Seeker"}</p>
                  
                  <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary/60" />
                      {candidate.location || "Ireland"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary/60" />
                      {candidate.experience_years || 0} Years Experience
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary/60" />
                      {candidate.desired_job_type || "Full-time"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About / Bio */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {candidate.bio || "No summary provided."}
              </p>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {candidate.work_experience?.length > 0 ? (
                candidate.work_experience.map((work, i) => (
                  <div key={i} className="relative pl-6 border-l-2 border-muted pb-2 last:pb-0">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                    <h4 className="font-bold text-base">{work.position}</h4>
                    <p className="text-sm font-medium text-primary mb-1">{work.company}</p>
                    <p className="text-xs text-muted-foreground mb-3">{work.startDate} — {work.current ? "Present" : work.endDate}</p>
                    <p className="text-sm text-muted-foreground">{work.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No work experience listed.</p>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {candidate.education?.length > 0 ? (
                candidate.education.map((edu, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{edu.degree}</h4>
                      <p className="text-xs font-medium text-muted-foreground">{edu.institution}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{edu.year}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No education listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Sidebar Info & Actions */}
        <div className="w-full lg:w-80 space-y-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 space-y-4">
              <Button className="w-full" onClick={handleDownloadCV}>
                <Download className="w-4 h-4 mr-2" />
                Download CV
                {!hasAccess && <Lock className="w-3.5 h-3.5 ml-2 opacity-60" />}
              </Button>
              {hasPro ? (
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/dashboard/messages?candidateId=${candidate.userId}`}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Candidate
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" className="w-full text-muted-foreground" disabled>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                  <Lock className="w-3.5 h-3.5 ml-2 opacity-60" />
                </Button>
              )}
              
              {!hasAccess && (
                <div className="pt-4 mt-4 border-t border-dashed">
                  <p className="text-[11px] text-center text-muted-foreground mb-3">
                    Upgrade your plan to unlock contact details and messaging.
                  </p>
                  <Button asChild size="sm" variant="secondary" className="w-full text-[11px] h-8">
                    <Link to="/dashboard/billing">View Subscription Plans</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {candidate.skills?.length > 0 ? (
                candidate.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="font-normal px-2.5 py-1">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No skills listed.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Availability</span>
                <span className="font-medium">{candidate.availability || "Immediate"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Min. Salary</span>
                <span className="font-medium">{candidate.expectedSalary ? `${candidate.expectedSalary} / ${candidate.salaryPeriod}` : "Negotiable"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Languages</span>
                <span className="font-medium text-right ml-4">{candidate.languages || "English"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Professional Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasAccess ? (
                <>
                  {candidate.linkedin && (
                    <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary">
                      <Linkedin className="w-4 h-4 text-[#0A66C2]" /> LinkedIn Profile
                    </a>
                  )}
                  {candidate.github && (
                    <a href={candidate.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary">
                      <Github className="w-4 h-4 text-black" /> GitHub Repository
                    </a>
                  )}
                  {candidate.portfolio_url && (
                    <a href={candidate.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary">
                      <Globe className="w-4 h-4 text-blue-500" /> Personal Portfolio
                    </a>
                  )}
                  {!candidate.linkedin && !candidate.github && !candidate.portfolio_url && (
                    <p className="text-xs text-muted-foreground italic">No links provided.</p>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center py-4 bg-muted/30 rounded-lg text-center px-4">
                  <Lock className="w-5 h-5 text-muted-foreground mb-2" />
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Links are hidden for non-subscribers.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CandidateSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-bold">Candidate not found</h3>
      <p className="text-sm text-muted-foreground mb-6">This profile might be private or no longer exists.</p>
      <Button asChild variant="outline">
        <Link to="/dashboard/cv-search">Back to Search</Link>
      </Button>
    </div>
  );
}

function AlertTriangle(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
