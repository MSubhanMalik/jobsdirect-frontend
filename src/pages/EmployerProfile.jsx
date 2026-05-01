import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/services/AxiosService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Globe, MapPin, Briefcase } from "lucide-react";
import JobCard from "@/components/jobs/JobCard";

export default function EmployerProfilePage() {
  const { slug } = useParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["employer-profile", slug],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/employers/profile/${slug}`);
      return res.data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Employer not found</h2>
        <p className="text-muted-foreground mt-2">This employer profile doesn't exist or is not yet approved.</p>
      </div>
    );
  }

  const jobs = profile.active_jobs || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.company_name}</h1>
              <div className="flex items-center gap-4 mt-1 text-primary-foreground/70 text-sm">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-foreground">
                    <Globe className="w-3.5 h-3.5" /> {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {profile.phone && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.phone}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {profile.business_activity_description && (
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-2">About</h2>
              <p className="text-sm text-muted-foreground">{profile.business_activity_description}</p>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Active Jobs ({jobs.length})
          </h2>
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No active jobs at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
