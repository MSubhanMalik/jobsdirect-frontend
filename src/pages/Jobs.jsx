import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import jobService from "@/services/job";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, Loader2 } from "lucide-react";
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

      // Append new page results to accumulated list
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
    setFilters({ keyword: "", location: "", type: "", category: "", is_featured: false, is_highlighted: false, is_urgent: false });
    setPage(1);
    setAllJobs([]);
    setSearchParams({}, { replace: true });
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header — light, editorial */}
      <div className="relative bg-muted/40 border-b border-border/50 pt-12 sm:pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4 block">
              Opportunities
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-foreground mb-3">
              Browse Jobs
            </h1>
            <p className="text-muted-foreground text-lg">
              {total > 0
                ? `${total.toLocaleString()} active opportunit${total === 1 ? "y" : "ies"} across Ireland`
                : "Search for your next opportunity"}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filter bar — overlapping the header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-9 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <JobFilters filters={filters} onChange={handleFilterChange} onClear={handleClear} />
        </motion.div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading && page === 1 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border/60 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-11 h-11 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-4/5" />
                <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                  <Skeleton className="h-7 w-28 rounded-md" />
                  <Skeleton className="h-7 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : allJobs.length > 0 ? (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{allJobs.length}</span> of {total} job{total !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Job list */}
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

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="rounded-full px-8 h-12 font-medium text-[0.95rem] gap-2"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Load More Jobs
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  {total - allJobs.length} more job{total - allJobs.length !== 1 ? "s" : ""} available
                </p>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Try adjusting your search filters or browse all available positions.
            </p>
            <Button
              variant="outline"
              onClick={handleClear}
              className="rounded-full px-6 h-10 font-medium"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
