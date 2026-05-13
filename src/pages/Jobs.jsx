import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import jobService from "@/services/job";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, Loader2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import JobCard from "../components/jobs/JobCard";
import JobFilters from "../components/jobs/JobFilters";

const PAGE_SIZE = 10;

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    location: searchParams.get("location") || "",
    type: searchParams.get("type") || "",
    category: searchParams.get("category") || "",
    work_type: searchParams.get("work_type") || "",
    date_posted: searchParams.get("date_posted") || "",
    is_highlighted: searchParams.get("is_highlighted") === "true",
    is_urgent: searchParams.get("is_urgent") === "true",
  });
  const [page, setPage] = useState(1);
  const [allJobs, setAllJobs] = useState([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["jobs", filters.keyword, filters.location, filters.type, filters.category, filters.work_type, filters.date_posted, filters.is_highlighted, filters.is_urgent, page],
    queryFn: async () => {
      const result = await jobService.list({
        status: "approved",
        keyword: filters.keyword || undefined,
        locationSearch: filters.location || undefined,
        job_type: filters.type || undefined,
        category: filters.category || undefined,
        work_type: filters.work_type || undefined,
        date_posted: filters.date_posted || undefined,
        is_highlighted: filters.is_highlighted ? "true" : undefined,
        is_urgent: filters.is_urgent ? "true" : undefined,
        page,
        pageSize: PAGE_SIZE,
      });

      setAllJobs((prev) => {
        if (page === 1) return result.items || [];
        const existingIds = new Set(prev.map((j) => j.id));
        const newItems = (result.items || []).filter((j) => !existingIds.has(j.id));
        return [...prev, ...newItems];
      });

      return result;
    },
  });

  const total = data?.total || 0;
  const hasMore = allJobs.length < total;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setAllJobs([]);
    const params = new URLSearchParams();
    if (newFilters.keyword) params.set("keyword", newFilters.keyword);
    if (newFilters.location) params.set("location", newFilters.location);
    if (newFilters.type) params.set("type", newFilters.type);
    if (newFilters.category) params.set("category", newFilters.category);
    if (newFilters.work_type) params.set("work_type", newFilters.work_type);
    if (newFilters.date_posted) params.set("date_posted", newFilters.date_posted);
    if (newFilters.is_highlighted) params.set("is_highlighted", "true");
    if (newFilters.is_urgent) params.set("is_urgent", "true");
    setSearchParams(params, { replace: true });
  };

  const handleClear = () => {
    setFilters({ keyword: "", location: "", type: "", category: "", work_type: "", date_posted: "", is_highlighted: false, is_urgent: false });
    setPage(1);
    setAllJobs([]);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dark header with search */}
      <div className="relative bg-[#1a2332] pt-14 pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-[#4eca8b]/[0.04] rounded-full blur-[100px]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#4eca8b]/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[#4eca8b]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                  Browse Jobs
                </h1>
                <p className="text-sm text-white/40">
                  {total > 0 ? `${total.toLocaleString()} opportunities across Ireland` : "Search for your next opportunity"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Search bar embedded in dark header */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <JobFilters filters={filters} onChange={handleFilterChange} onClear={handleClear} variant="dark" />
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {isLoading && page === 1 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border/60 p-5">
                <div className="flex items-center gap-4 mb-3">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <div className="flex gap-2 mt-3">
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : allJobs.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{allJobs.length}</span> of {total} result{total !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-3">
              {allJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: (index % PAGE_SIZE) * 0.03 }}
                >
                  <JobCard job={job} />
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-12">
                <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={isFetching} className="rounded-full px-8 h-11 font-medium gap-2">
                  {isFetching ? <><Loader2 className="w-4 h-4 animate-spin" />Loading...</> : <><ChevronDown className="w-4 h-4" />Load More Jobs</>}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">{total - allJobs.length} more available</p>
              </div>
            )}
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Try adjusting your search filters or browse all available positions.</p>
            <Button variant="outline" onClick={handleClear} className="rounded-full px-6 h-10 font-medium">Clear Filters</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
