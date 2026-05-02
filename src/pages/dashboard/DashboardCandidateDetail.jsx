import React from "react";
import { useOutletContext, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, Briefcase, GraduationCap, FileText, ArrowLeft,
  MessageSquare, Download, Lock, Globe, Linkedin, Github,
  User, AlertCircle, ArrowRight, Clock, ExternalLink, Award, FolderOpen
} from "lucide-react";
import employeeService from "@/services/employee";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "react-toastify";

export default function DashboardCandidateDetail() {
  const { id } = useParams();
  const { employer } = useOutletContext();
  const { settings: appSettings } = useSiteSettings();
  const viewConfig = appSettings?.employee_candidate_view_config || {};

  const hasAccess = employer?.candidate_database_access;
  const hasPro = employer?.candidate_database_status === "cv_db_pro";

  const show = (key) => viewConfig[key]?.visible !== false;

  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ["candidate-detail", id],
    queryFn: () => employeeService.getById(id),
  });

  const handleDownloadCV = () => {
    if (!hasAccess) { toast.error("Upgrade to download CVs."); return; }
    if (candidate.cv_url) window.open(candidate.cv_url, "_blank");
    else toast.info("No CV uploaded by this candidate.");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <div className="rounded-xl border border-border/50 bg-card p-8">
          <div className="flex items-start gap-5">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <div className="flex gap-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-28" /></div>
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7 text-muted-foreground/30" />
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">Candidate not found</h3>
        <p className="text-sm text-muted-foreground mb-6">This profile may be private or no longer exists.</p>
        <Link to="/dashboard/cv-search">
          <Button variant="outline" className="rounded-full px-6">Back to Search</Button>
        </Link>
      </div>
    );
  }

  const fullName = `${candidate.user?.first_name || ""} ${candidate.user?.last_name || ""}`.trim() || "Candidate";

  // Build info items based on config
  const infoItems = [];
  if (show("availability")) infoItems.push({ label: "Availability", value: candidate.availability || "Negotiable" });
  if (show("expected_salary")) infoItems.push({ label: "Expected Salary", value: candidate.expected_salary ? `€${Number(candidate.expected_salary).toLocaleString()} / ${candidate.salary_period || "year"}` : "Negotiable" });
  if (show("languages")) infoItems.push({ label: "Languages", value: candidate.languages || "English" });
  if (show("right_to_work") && candidate.right_to_work) infoItems.push({ label: "Right to Work", value: candidate.right_to_work.replace(/_/g, " ") });
  if (show("driving_licence") && candidate.driving_licence && candidate.driving_licence !== "none") infoItems.push({ label: "Driving Licence", value: candidate.driving_licence.replace(/_/g, " ") });
  if (show("nationality") && candidate.nationality) infoItems.push({ label: "Nationality", value: candidate.nationality });
  if (show("gender") && candidate.gender && candidate.gender !== "prefer_not_to_say") infoItems.push({ label: "Gender", value: candidate.gender.replace(/_/g, " ") });
  if (show("date_of_birth") && candidate.date_of_birth) infoItems.push({ label: "Date of Birth", value: candidate.date_of_birth });
  if (show("phone") && candidate.phone && hasAccess) infoItems.push({ label: "Phone", value: candidate.phone });
  if (show("address") && candidate.address && hasAccess) infoItems.push({ label: "Address", value: candidate.address });

  // Build link items based on config
  const linkItems = [];
  if (show("linkedin") && candidate.linkedin) linkItems.push({ href: candidate.linkedin, icon: Linkedin, label: "LinkedIn" });
  if (show("github") && candidate.github) linkItems.push({ href: candidate.github, icon: Github, label: "GitHub" });
  if (show("portfolio_url") && candidate.portfolio_url) linkItems.push({ href: candidate.portfolio_url, icon: Globe, label: "Portfolio" });
  if (show("website") && candidate.website) linkItems.push({ href: candidate.website, icon: Globe, label: "Website" });

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </button>

      {/* Profile header */}
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <h1 className="text-2xl font-display font-bold text-foreground">{fullName}</h1>
        {show("is_searchable") && candidate.is_searchable && (
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Available" />
        )}
      </div>
      {show("title") && <p className="text-base text-muted-foreground mb-3">{candidate.title || "Job Seeker"}</p>}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground mb-6">
        {show("county") && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{candidate.location || candidate.county || "Ireland"}</span>}
        {show("experience_years") && <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{candidate.experience_years || 0}y experience</span>}
        {show("desired_job_type") && <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{candidate.desired_job_type?.replace("_", " ") || "Full time"}</span>}
        {show("desired_location") && candidate.desired_location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Wants: {candidate.desired_location}</span>}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          {/* Summary */}
          {show("bio") && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="text-base font-display font-semibold text-foreground">Professional Summary</h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {candidate.bio || "No summary provided."}
                </p>
              </div>
            </div>
          )}

          {/* Work Experience */}
          {show("work_experience") && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="text-base font-display font-semibold text-foreground">Work Experience</h2>
              </div>
              <div className="px-6 py-5">
                {candidate.work_experience?.length > 0 ? (
                  <div className="space-y-0">
                    {candidate.work_experience.map((work, i) => (
                      <div key={i} className="flex gap-4 pb-6 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-lg bg-accent/[0.08] flex items-center justify-center shrink-0">
                            <Briefcase className="w-3.5 h-3.5 text-accent" />
                          </div>
                          {i < candidate.work_experience.length - 1 && (
                            <div className="w-px flex-1 bg-border/60 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground">{work.job_title || work.position}</h4>
                          <p className="text-sm text-accent font-medium">{work.company}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {work.start_date} — {work.current ? "Present" : (work.end_date || "N/A")}
                          </p>
                          {(work.responsibilities || work.description) && (
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{work.responsibilities || work.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No work experience listed.</p>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {show("education") && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="text-base font-display font-semibold text-foreground">Education</h2>
              </div>
              <div className="px-6 py-5">
                {candidate.education?.length > 0 ? (
                  <div className="space-y-4">
                    {candidate.education.map((edu, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">{edu.degree}</h4>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          {(edu.field_of_study || edu.year) && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {edu.field_of_study}{edu.year ? ` — ${edu.year}` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No education listed.</p>
                )}
              </div>
            </div>
          )}

          {/* Certifications */}
          {show("certifications") && candidate.certifications?.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="text-base font-display font-semibold text-foreground">Certifications</h2>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  {candidate.certifications.map((cert, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Award className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{cert.name}</h4>
                        {cert.issuing_organisation && <p className="text-sm text-muted-foreground">{cert.issuing_organisation}</p>}
                        {(cert.issue_date || cert.expiry_date) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {cert.issue_date}{cert.expiry_date ? ` — ${cert.expiry_date}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Projects */}
          {show("projects") && candidate.projects?.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="text-base font-display font-semibold text-foreground">Projects</h2>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  {candidate.projects.map((proj, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{proj.name}</h4>
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">{proj.url}</a>
                        )}
                        {proj.description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{proj.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-11 font-medium"
              onClick={handleDownloadCV}
            >
              <Download className="w-4 h-4 mr-2" /> Download CV
              {!hasAccess && <Lock className="w-3 h-3 ml-auto opacity-50" />}
            </Button>
            {hasPro ? (
              <Button asChild variant="outline" className="w-full rounded-xl h-11">
                <Link to={`/dashboard/messages?candidateId=${candidate.user_id}`}>
                  <MessageSquare className="w-4 h-4 mr-2" /> Message Candidate
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="w-full rounded-xl h-11 text-muted-foreground" disabled>
                <MessageSquare className="w-4 h-4 mr-2" /> Message
                <Lock className="w-3 h-3 ml-auto opacity-50" />
              </Button>
            )}
            {!hasAccess && (
              <div className="pt-3 border-t border-border/40 text-center">
                <p className="text-[0.65rem] text-muted-foreground mb-2">Upgrade to unlock full access.</p>
                <Link to="/dashboard/billing">
                  <Button variant="secondary" size="sm" className="w-full rounded-lg h-8 text-xs font-medium">
                    View Plans
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Skills */}
          {show("skills") && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border/40">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Skills</h3>
              </div>
              <div className="px-5 py-4 flex flex-wrap gap-1.5">
                {candidate.skills?.length > 0 ? (
                  candidate.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-[0.65rem] font-medium rounded-md px-2.5 py-1 bg-muted/70">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No skills listed.</p>
                )}
              </div>
            </div>
          )}

          {/* Info */}
          {infoItems.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border/40">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Information</h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground text-right ml-4">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(show("linkedin") || show("github") || show("portfolio_url") || show("website")) && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border/40">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Professional Links</h3>
              </div>
              <div className="px-5 py-4">
                {hasAccess ? (
                  <div className="space-y-2.5">
                    {linkItems.map((link) => (
                      <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-accent transition-colors group">
                        <link.icon className="w-4 h-4" /> {link.label}
                        <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                    {linkItems.length === 0 && (
                      <p className="text-xs text-muted-foreground">No links provided.</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                    <Lock className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    <p className="text-xs text-muted-foreground">Links hidden for non-subscribers.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
