import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Building2, Star, Sparkles, Bookmark, AlertTriangle, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import savedJobService from "@/services/savedJob";
import { Features } from "@/config/features";

const jobTypeLabels = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  temporary: "Temporary",
  internship: "Internship",
  remote: "Remote",
};

const categoryLabels = {
  technology: "Technology", healthcare: "Healthcare", finance: "Finance",
  education: "Education", engineering: "Engineering", sales: "Sales",
  marketing: "Marketing", hospitality: "Hospitality", retail: "Retail",
  construction: "Construction", transport: "Transport", admin: "Admin",
  legal: "Legal", manufacturing: "Manufacturing", other: "Other",
};

export default function JobCard({ job, initialSaved = false }) {
  const { isAuthenticated } = useAuthStore();
  const [saved, setSaved] = useState(initialSaved);
  const [checking, setChecking] = useState(!initialSaved && isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || initialSaved) return;
    savedJobService.check(job.id)
      .then((res) => setSaved(res.saved))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [job.id, isAuthenticated, initialSaved]);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    const result = await savedJobService.toggle(job.id);
    setSaved(result.saved);
  };

  return (
    <Link to={`/jobs/${job.id}`}>
      <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-border/60 ${
        job.is_highlighted ? "bg-amber-50/40 border-amber-200/60" : "bg-card"
      }`}>
        {/* Top accent for featured */}
        {Features.featuredAddon && job.is_featured && (
          <div className="h-[3px] bg-gradient-to-r from-accent to-accent/50" />
        )}

        <CardContent className="p-0">
          <div className="p-5 sm:p-6">
            {/* Row 1: Company info + salary */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{job.company_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {Features.featuredAddon && job.is_featured && (
                      <span className="flex items-center gap-1 text-accent text-[0.65rem] font-semibold uppercase tracking-wider">
                        <Star className="w-2.5 h-2.5 fill-accent" />
                        Featured
                      </span>
                    )}
                    {job.is_highlighted && (
                      <span className="flex items-center gap-1 text-amber-600 text-[0.65rem] font-semibold uppercase tracking-wider">
                        <Sparkles className="w-2.5 h-2.5" />
                        Highlighted
                      </span>
                    )}
                    {job.is_urgent && (
                      <span className="flex items-center gap-1 text-red-500 text-[0.65rem] font-semibold uppercase tracking-wider">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {(job.salary_min || job.salary_max) && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">
                      €{job.salary_min?.toLocaleString()}{job.salary_max ? `–${job.salary_max.toLocaleString()}` : "+"}
                    </p>
                    {job.salary_period && (
                      <p className="text-[0.7rem] text-muted-foreground">/{job.salary_period}</p>
                    )}
                  </div>
                )}
                {isAuthenticated && (
                  <button
                    onClick={handleSave}
                    className="w-9 h-9 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors shrink-0"
                    title={saved ? "Remove from saved" : "Save job"}
                  >
                    <Bookmark className={`w-4 h-4 transition-colors ${saved ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: Title */}
            <h3 className="text-[1.1rem] font-display font-bold text-foreground group-hover:text-accent transition-colors duration-200 mb-2 line-clamp-1">
              {job.title}
            </h3>

            {/* Row 3: Description */}
            <p className="text-[0.82rem] text-muted-foreground line-clamp-2 leading-relaxed mb-5">
              {job.short_description || job.description?.slice(0, 160)}
            </p>

            {/* Row 4: Badges + arrow */}
            <div className="flex items-center gap-2 pt-4 border-t border-border/40">
              <Badge variant="secondary" className="text-[0.7rem] font-medium rounded-md px-2.5 py-1 bg-muted/70">
                <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                {job.location}
              </Badge>
              <Badge variant="secondary" className="text-[0.7rem] font-medium rounded-md px-2.5 py-1 bg-muted/70">
                <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                {jobTypeLabels[job.job_type] || job.job_type}
              </Badge>
              {job.category && (
                <Badge variant="outline" className="text-[0.7rem] rounded-md px-2.5 py-1 hidden sm:flex">
                  {categoryLabels[job.category] || job.category}
                </Badge>
              )}
              <div className="ml-auto w-8 h-8 rounded-full bg-muted/50 group-hover:bg-accent flex items-center justify-center transition-all duration-200 shrink-0">
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent-foreground transition-colors duration-200" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
