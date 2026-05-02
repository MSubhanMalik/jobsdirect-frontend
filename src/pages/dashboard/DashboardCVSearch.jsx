import React, { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, MapPin, Briefcase, GraduationCap, FileText, Lock, Crown,
  X, ChevronRight, MessageSquare, Download, ArrowRight, ChevronLeft, User, AlertCircle
} from "lucide-react";
import employeeService from "@/services/employee";
import { toast } from "react-toastify";

export default function DashboardCVSearch() {
  const { user, employer } = useOutletContext();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [page, setPage] = useState(1);

  const hasAccess = employer?.candidate_database_access;
  const hasPro = employer?.candidate_database_status === "cv_db_pro";

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["candidate-search", search, location, experience, page],
    queryFn: () => employeeService.list({
      q: search,
      location,
      experience_years: experience,
      page,
      pageSize: 10,
    }),
    keepPreviousData: true,
  });

  const candidates = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;
  const hasFilters = search || location || (experience && experience !== "0");

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handleClear = () => {
    setSearch("");
    setLocation("");
    setExperience("");
    setPage(1);
  };

  const handleDownloadCV = (candidate) => {
    if (!hasAccess) { toast.error("Upgrade to access CVs."); return; }
    if (candidate.cv_url) window.open(candidate.cv_url, "_blank");
    else toast.info("No CV uploaded by this candidate.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">CV Database</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Find and reach out to top talent across Ireland.</p>
        </div>
        {!hasAccess && (
          <Link to="/dashboard/billing">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-5 h-9 text-sm font-medium group">
              <Crown className="w-4 h-4 mr-1.5" /> Upgrade to Access
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        )}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch}>
        <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row items-stretch gap-0">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 w-[1.1rem] h-[1.1rem] text-muted-foreground/50" />
              <Input
                placeholder="Skills, title, or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-12 pl-11 text-[0.95rem] placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="hidden sm:flex items-center"><div className="w-px h-7 bg-border" /></div>
            <div className="relative flex-1 flex items-center">
              <MapPin className="absolute left-4 w-[1.1rem] h-[1.1rem] text-muted-foreground/50 z-10" />
              <Input
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-12 pl-11 text-[0.95rem] placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="hidden sm:flex items-center"><div className="w-px h-7 bg-border" /></div>
            <div className="hidden sm:block">
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 h-12 w-40 text-[0.95rem] text-muted-foreground/70">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Experience</SelectItem>
                  <SelectItem value="1">1+ Year</SelectItem>
                  <SelectItem value="3">3+ Years</SelectItem>
                  <SelectItem value="5">5+ Years</SelectItem>
                  <SelectItem value="10">10+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pl-1">
              {hasFilters && (
                <Button type="button" variant="ghost" size="icon" onClick={handleClear} className="h-10 w-10 rounded-xl text-muted-foreground shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-6 rounded-xl font-semibold text-[0.95rem] shrink-0">
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-28 mb-3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-display font-semibold text-red-900 mb-1">Unable to load candidates</h3>
          <p className="text-sm text-red-700 mb-5 max-w-sm mx-auto">{error?.message || "Please try again."}</p>
          <Button onClick={() => refetch()} variant="outline" className="rounded-full px-6 border-red-200 hover:bg-red-100">
            Retry
          </Button>
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-muted-foreground/25" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">No candidates found</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">Try broadening your search or removing filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{candidates.length}</span> of {total} candidate{total !== 1 ? "s" : ""}
          </p>

          <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="px-5 py-5 hover:bg-muted/20 transition-colors group">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {candidate.profile_photo_url ? (
                      <img src={candidate.profile_photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link
                        to={`/dashboard/cv-search/${candidate.id}`}
                        className="text-[0.95rem] font-display font-semibold text-foreground hover:text-accent transition-colors truncate"
                      >
                        {candidate.user?.first_name} {candidate.user?.last_name}
                      </Link>
                      {candidate.is_searchable && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Available" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{candidate.title || "Job Seeker"}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                      {candidate.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{candidate.location}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />{candidate.experience_years || 0}y experience
                      </span>
                      {candidate.education?.[0]?.degree && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />{candidate.education[0].degree}
                        </span>
                      )}
                    </div>

                    {candidate.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.skills.slice(0, 5).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-[0.6rem] font-medium rounded-md px-2 py-0.5 bg-muted/70">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 5 && (
                          <span className="text-[0.6rem] text-muted-foreground self-center">+{candidate.skills.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-lg w-28 justify-start">
                      <Link to={`/dashboard/cv-search/${candidate.id}`}>
                        <FileText className="w-3.5 h-3.5 mr-1.5" /> Profile
                      </Link>
                    </Button>
                    <Button
                      variant="outline" size="sm" className="h-8 text-xs rounded-lg w-28 justify-start"
                      onClick={() => handleDownloadCV(candidate)}
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" /> CV
                      {!hasAccess && <Lock className="w-3 h-3 ml-auto text-muted-foreground/50" />}
                    </Button>
                    {hasPro ? (
                      <Button asChild size="sm" className="h-8 text-xs rounded-lg w-28 justify-start bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link to={`/dashboard/messages?candidateId=${candidate.user_id}`}>
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-8 text-xs rounded-lg w-28 justify-start text-muted-foreground" disabled>
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message
                        <Lock className="w-3 h-3 ml-auto" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="h-10 px-4 rounded-xl font-medium">
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <span className="text-sm text-muted-foreground px-4">Page {page} of {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="h-10 px-4 rounded-xl font-medium">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Upgrade promo */}
      {!hasAccess && (
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/[0.08] flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-foreground mb-1">Unlock the CV Database</h3>
              <p className="text-sm text-muted-foreground mb-4">Full candidate profiles, downloadable CVs, and direct messaging.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="rounded-lg border border-border/50 bg-card p-4">
                  <p className="text-sm font-display font-bold text-foreground">Lite Plan</p>
                  <p className="text-xs text-muted-foreground mt-1">View profiles & download CVs</p>
                </div>
                <div className="rounded-lg border border-accent/30 bg-card p-4 relative">
                  <span className="absolute top-2 right-2 text-[0.55rem] font-bold uppercase tracking-wider text-accent">Popular</span>
                  <p className="text-sm font-display font-bold text-foreground">Pro Plan</p>
                  <p className="text-xs text-muted-foreground mt-1">Lite + in-platform messaging</p>
                </div>
              </div>
              <Link to="/dashboard/billing">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-10 font-medium group">
                  Upgrade Now <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
