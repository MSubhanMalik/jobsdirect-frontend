import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Building2, Star, Sparkles, Bookmark, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import savedJobService from "@/services/savedJob";

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
      <Card className={`group hover:shadow-lg transition-all duration-300 ${job.is_highlighted ? "border-blue-300 bg-blue-50/30 shadow-sm" : "hover:border-accent/30"}`}>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {job.is_featured && (
                  <span className="flex items-center gap-1 text-accent text-xs font-semibold">
                    <Star className="w-3 h-3 fill-accent" />
                    FEATURED
                  </span>
                )}
                {job.is_highlighted && (
                  <span className="flex items-center gap-1 text-blue-600 text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    HIGHLIGHTED
                  </span>
                )}
                {job.is_urgent && (
                  <span className="flex items-center gap-1 text-red-600 text-xs font-semibold">
                    <AlertTriangle className="w-3 h-3" />
                    URGENT
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{job.company_name}</span>
              </div>
            </div>
            {(job.salary_min || job.salary_max) && (
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-accent">
                  €{job.salary_min?.toLocaleString()}{job.salary_max ? ` - €${job.salary_max.toLocaleString()}` : "+"}
                </p>
                {job.salary_period && (
                  <p className="text-xs text-muted-foreground">per {job.salary_period}</p>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {job.short_description || job.description?.slice(0, 150)}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="text-xs font-medium">
              <MapPin className="w-3 h-3 mr-1" />
              {job.location}
            </Badge>
            <Badge variant="secondary" className="text-xs font-medium">
              <Clock className="w-3 h-3 mr-1" />
              {jobTypeLabels[job.job_type] || job.job_type}
            </Badge>
            {job.category && (
              <Badge variant="outline" className="text-xs">
                {categoryLabels[job.category] || job.category}
              </Badge>
            )}
            {isAuthenticated && (
              <button
                onClick={handleSave}
                className="ml-auto shrink-0 text-muted-foreground hover:text-accent transition-colors"
                title={saved ? "Remove from saved" : "Save job"}
              >
                <Bookmark className={`w-4 h-4 ${saved ? "fill-accent text-accent" : ""}`} />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}