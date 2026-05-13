import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Building2, Sparkles, Bookmark, AlertTriangle, Wifi, Calendar, Euro } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import savedJobService from "@/services/savedJob";

const jobTypeLabels = {
  full_time: "Full Time", part_time: "Part Time", contract: "Contract",
  temporary: "Temporary", internship: "Internship", remote: "Remote",
};

const remoteModeLabels = {
  on_site: "On-site", hybrid: "Hybrid", remote: "Remote", blended: "Blended",
};

export default function JobCard({ job }) {
  const { isAuthenticated } = useAuthStore();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    savedJobService.check(job.id).then((res) => setSaved(res.saved)).catch(() => {});
  }, [job.id, isAuthenticated]);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    const result = await savedJobService.toggle(job.id);
    setSaved(result.saved);
  };

  const daysAgo = job.created_at ? Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000) : null;
  const postedLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : daysAgo !== null && daysAgo < 30 ? `${daysAgo}d ago` : null;
  const hasSalary = job.salary_min || job.salary_max;
  const descText = job.short_description || job.description?.replace(/<[^>]*>/g, "").slice(0, 200) || "";

  return (
    <Link to={`/jobs/${job.slug || job.id}`} className="block group">
      <div className={`relative bg-card rounded-xl border border-border/60 p-5 sm:p-6 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-[#4eca8b]/40 ${
        job.is_highlighted ? "ring-1 ring-[#4eca8b]/30 bg-[#4eca8b]/[0.03]" : ""
      }`}>

        {/* Row 1: Company + badges + salary + save */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-muted/80 flex items-center justify-center shrink-0">
              <Building2 className="w-4.5 h-4.5 text-muted-foreground/50" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground truncate">{job.company_name}</span>
                {job.is_urgent && (
                  <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-2.5 h-2.5" />Urgent
                  </span>
                )}
                {job.is_highlighted && (
                  <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    <Sparkles className="w-2.5 h-2.5" />Highlighted
                  </span>
                )}
              </div>
              {postedLabel && (
                <span className="text-xs text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />{postedLabel}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasSalary && (
              <span className="text-sm font-bold text-[#4eca8b] whitespace-nowrap">
                €{job.salary_min?.toLocaleString()}{job.salary_max && job.salary_max !== job.salary_min ? `–${job.salary_max.toLocaleString()}` : ""}
                {job.salary_period && <span className="text-xs font-normal text-muted-foreground">/{job.salary_period}</span>}
              </span>
            )}
            {isAuthenticated && (
              <button onClick={handleSave} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                <Bookmark className={`w-4 h-4 ${saved ? "fill-[#4eca8b] text-[#4eca8b]" : "text-muted-foreground/40"}`} />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Title */}
        <h3 className="text-[1.05rem] sm:text-lg font-display font-bold text-foreground group-hover:text-[#4eca8b] transition-colors mb-1.5 line-clamp-1">
          {job.title || "Untitled Position"}
        </h3>

        {/* Row 3: Description */}
        {descText && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{descText}</p>
        )}

        {/* Row 4: Info pills */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-border/40">
          {job.location && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1">
              <MapPin className="w-3 h-3" />{job.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1">
            <Clock className="w-3 h-3" />{jobTypeLabels[job.job_type] || job.job_type || "Full Time"}
          </span>
          {job.remote_work_mode && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1">
              <Wifi className="w-3 h-3" />{remoteModeLabels[job.remote_work_mode]}
            </span>
          )}
          {job.sector && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1 hidden sm:flex capitalize">
              {job.sector.replace(/_/g, " ")}
            </span>
          )}
          {job.expires_at && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1 hidden md:flex">
              <Calendar className="w-3 h-3" />Closes {new Date(job.expires_at).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
