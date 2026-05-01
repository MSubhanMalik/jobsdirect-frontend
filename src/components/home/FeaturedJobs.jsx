import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import jobService from "@/services/job";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ArrowRight, Star, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const jobTypeLabels = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  temporary: "Temporary",
  internship: "Internship",
  remote: "Remote",
};

export default function FeaturedJobs() {
  const { data: featuredData, isLoading } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: () => jobService.list({ status: "approved", is_featured: "true", pageSize: 6 }),
  });
  const jobs = featuredData?.items || [];

  const { data: latestData } = useQuery({
    queryKey: ["latest-jobs"],
    queryFn: () => jobService.list({ status: "approved", pageSize: 6 }),
    enabled: !isLoading && jobs.length === 0,
  });
  const latestJobs = latestData?.items || [];

  const displayJobs = jobs.length > 0 ? jobs : latestJobs;

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header — editorial style */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6 mb-16"
        >
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
            Featured Opportunities
          </h2>
          <div className="h-px flex-1 bg-border" />
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl border p-6">
                <Skeleton className="h-4 w-20 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-5" />
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Link to={`/jobs/${job.id}`}>
                  <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border border-border/60 h-full">
                    <CardContent className="p-0">
                      {/* Top accent bar for featured */}
                      {job.is_featured && (
                        <div className="h-1 bg-gradient-to-r from-accent to-accent/60" />
                      )}

                      <div className="p-6">
                        {/* Header: company + salary */}
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                              <Building2 className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{job.company_name}</p>
                              {job.is_featured && (
                                <span className="text-[0.65rem] font-semibold text-accent uppercase tracking-wider">Featured</span>
                              )}
                            </div>
                          </div>
                          {(job.salary_min || job.salary_max) && (
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-accent">
                                €{job.salary_min?.toLocaleString()}{job.salary_max ? `–${job.salary_max.toLocaleString()}` : "+"}
                              </p>
                              {job.salary_period && (
                                <p className="text-[0.7rem] text-muted-foreground">/{job.salary_period}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-[1.1rem] font-display font-bold text-foreground group-hover:text-accent transition-colors duration-200 mb-2 line-clamp-1">
                          {job.title}
                        </h3>

                        {/* Description */}
                        <p className="text-[0.82rem] text-muted-foreground line-clamp-2 leading-relaxed mb-5">
                          {job.short_description || job.description?.slice(0, 120)}
                        </p>

                        {/* Footer: badges + arrow */}
                        <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                          <Badge variant="secondary" className="text-[0.7rem] font-medium rounded-md px-2.5 py-1 bg-muted/70">
                            <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                            {job.location}
                          </Badge>
                          <Badge variant="secondary" className="text-[0.7rem] font-medium rounded-md px-2.5 py-1 bg-muted/70">
                            <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                            {jobTypeLabels[job.job_type] || job.job_type}
                          </Badge>
                          <div className="ml-auto w-8 h-8 rounded-full bg-muted/50 group-hover:bg-accent flex items-center justify-center transition-all duration-200">
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent-foreground transition-colors duration-200" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
              <Building2 className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">No jobs posted yet</h3>
            <p className="text-muted-foreground mb-6">Be the first employer to post a position.</p>
            <Link to="/employers">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6">
                Post a Job
              </Button>
            </Link>
          </div>
        )}

        {displayJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/jobs">
              <Button variant="outline" className="group rounded-full px-8 h-11 font-medium">
                View All Jobs
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
