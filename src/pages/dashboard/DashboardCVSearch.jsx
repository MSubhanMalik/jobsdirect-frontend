import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, GraduationCap, FileText, Lock, Crown, Filter, ChevronRight, MessageSquare, Download } from "lucide-react";
import employeeService from "@/services/employee";
import { toast } from "react-toastify";

export default function DashboardCVSearch() {
  const { user, employer, isEmployer } = useOutletContext();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [page, setPage] = useState(1);

  const hasAccess = employer?.candidate_database_access || employer?.candidateDatabaseAccess;
  const hasPro = employer?.candidate_database_status === "cv_db_pro" || employer?.candidateDatabaseStatus === "cv_db_pro";

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["candidate-search", search, location, experience, page],
    queryFn: () => employeeService.list({ 
      q: search, 
      location, 
      experience_years: experience, 
      page,
      pageSize: 10 
    }),
    keepPreviousData: true,
  });

  const candidates = data?.items || [];
  const totalPages = data?.totalPages || 1;

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handleClearFilters = () => {
    setSearch("");
    setLocation("");
    setExperience("");
    setPage(1);
  };

  const handleDownloadCV = (candidate) => {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">CV Database</h2>
          <p className="text-muted-foreground text-sm">Find and reach out to top talent across Ireland.</p>
        </div>
        {!hasAccess && (
          <Button asChild className="bg-amber-500 hover:bg-amber-600 border-none">
            <Link to="/dashboard/billing">
              <Crown className="w-4 h-4 mr-2" /> Upgrade to Access
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-muted/30">
        <CardContent className="p-4 space-y-4">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Skills, title, or name..." 
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative md:col-span-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Location..." 
                className="pl-9 bg-background"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Min Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any Experience</SelectItem>
                <SelectItem value="1">1+ Year</SelectItem>
                <SelectItem value="3">3+ Years</SelectItem>
                <SelectItem value="5">5+ Years</SelectItem>
                <SelectItem value="10">10+ Years</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Search</Button>
              {(search || location || experience !== "" && experience !== "0") && (
                <Button type="button" variant="ghost" size="icon" onClick={handleClearFilters} title="Clear Filters">
                  <Filter className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-32" />
            </Card>
          ))
        ) : isError ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-lg font-medium text-red-900">Unable to load candidates</p>
              <p className="text-sm text-red-700 max-w-xs mb-4">
                {error?.message || "There was an error connecting to the server. Please try refreshing the page."}
              </p>
              <Button onClick={() => refetch()} variant="outline" className="border-red-200 hover:bg-red-100">
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        ) : candidates.length === 0 ? (
          <Card className="border-dashed py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No candidates found</p>
              <p className="text-sm text-muted-foreground max-w-xs">Try broadening your search criteria or removing filters.</p>
            </CardContent>
          </Card>
        ) : (
          candidates.map((candidate) => (
            <Card key={candidate.id} className="group hover:border-primary/50 transition-all shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {candidate.profile_photo_url ? (
                        <img src={candidate.profile_photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Briefcase className="w-7 h-7 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg leading-tight truncate hover:text-primary transition-colors">
                          <Link to={`/dashboard/cv-search/${candidate.id}`}>
                            {candidate.user?.firstName} {candidate.user?.lastName}
                          </Link>
                        </h3>
                        {candidate.is_searchable && (
                          <Badge variant="outline" className="text-[10px] py-0 h-5 bg-green-50 text-green-700 border-green-200">
                            Available
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground mb-2">{candidate.title || "Job Seeker"}</p>
                      
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {candidate.location || "Ireland"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" />
                          {candidate.experience_years || 0} years experience
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {candidate.education?.[0]?.degree || "Higher Education"}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {candidate.skills?.slice(0, 5).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] font-normal px-2 py-0 h-5">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills?.length > 5 && (
                          <span className="text-[10px] text-muted-foreground ml-1">+{candidate.skills.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm" className="w-full lg:w-32">
                      <Link to={`/dashboard/cv-search/${candidate.id}`}>
                        <FileText className="w-3.5 h-3.5 mr-2" />
                        Profile
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full lg:w-32 justify-between"
                      onClick={() => handleDownloadCV(candidate)}
                    >
                      <Download className="w-3.5 h-3.5 mr-2" />
                      CV
                      {!hasAccess && <Lock className="w-3 h-3 ml-2 text-muted-foreground" />}
                    </Button>
                    {hasPro ? (
                      <Button asChild size="sm" className="w-full lg:w-32">
                        <Link to={`/dashboard/messages?candidateId=${candidate.userId}`}>
                          <MessageSquare className="w-3.5 h-3.5 mr-2" />
                          Message
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="w-full lg:w-32 text-muted-foreground" disabled>
                        <MessageSquare className="w-3.5 h-3.5 mr-2" />
                        Message
                        <Lock className="w-3 h-3 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === totalPages}
            onClick={() => setPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Access Modal/Promo */}
      {!hasAccess && (
        <Card className="bg-primary/5 border-primary/20 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Upgrade to CV Database Lite or Pro</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Unlock full candidate profiles, contact details, and downloadable CVs. Hire faster by reaching out to talent directly.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-background rounded-lg border">
                    <p className="font-bold text-lg mb-1">Lite Plan</p>
                    <p className="text-xs text-muted-foreground mb-2">View profiles & download CVs</p>
                    <p className="text-xl font-bold">€10<span className="text-xs font-normal text-muted-foreground"> /mo</span></p>
                  </div>
                  <div className="p-4 bg-background rounded-lg border border-primary/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 font-bold uppercase">Popular</div>
                    <p className="font-bold text-lg mb-1">Pro Plan</p>
                    <p className="text-xs text-muted-foreground mb-2">Lite + In-platform Messaging</p>
                    <p className="text-xl font-bold">€15<span className="text-xs font-normal text-muted-foreground"> /mo</span></p>
                  </div>
                </div>
                <Button asChild className="mt-6 w-full sm:w-auto">
                  <Link to="/dashboard/billing text-primary">Upgrade Now</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
