import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark } from "lucide-react";
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

  if (loading) return <p className="text-sm text-muted-foreground">Loading saved jobs...</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">Saved Jobs</h2>
      {savedJobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No saved jobs yet. Browse jobs and click the bookmark icon to save.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((saved) => (
            saved.job && <JobCard key={saved.id} job={saved.job} initialSaved={true} />
          ))}
        </div>
      )}
    </div>
  );
}
