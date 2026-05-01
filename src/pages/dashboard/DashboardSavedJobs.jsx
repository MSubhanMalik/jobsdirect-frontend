import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import savedJobService from "@/services/savedJob";
import JobCard from "@/components/jobs/JobCard";

export default function DashboardSavedJobs() {
  const { user } = useOutletContext();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    savedJobService.list()
      .then(setSavedJobs)
      .catch(() => setSavedJobs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32 mb-6" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Saved Jobs</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{savedJobs.length} bookmarked position{savedJobs.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {savedJobs.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-6 h-6 text-muted-foreground/25" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">No saved jobs yet</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">Browse jobs and tap the bookmark icon to save positions you're interested in.</p>
          <Link to="/jobs">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-10 font-medium">
              Browse Jobs
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {savedJobs.map((saved) => (
            saved.job && <JobCard key={saved.id} job={saved.job} initialSaved={true} />
          ))}
        </div>
      )}
    </div>
  );
}
