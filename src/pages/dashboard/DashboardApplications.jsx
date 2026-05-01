import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import applicationService from "@/services/application";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Send, Clock, Eye, CheckCircle, XCircle, Users } from "lucide-react";
import PaginationControls from "@/components/ui/pagination-controls";
import ApplicationList from "@/components/dashboard/employer/ApplicationList";

const statusIcons = {
  submitted: <Clock className="w-4 h-4 text-yellow-500" />,
  reviewed: <Eye className="w-4 h-4 text-primary" />,
  shortlisted: <CheckCircle className="w-4 h-4 text-accent" />,
  rejected: <XCircle className="w-4 h-4 text-destructive" />,
  hired: <CheckCircle className="w-4 h-4 text-accent" />,
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
};

export default function DashboardApplications() {
  const { user, isEmployer } = useOutletContext();
  const [page, setPage] = useState(1);

  const queryKey = isEmployer ? ["employer-applications", user.email, page] : ["my-applications", user.email, page];
  const queryFilter = isEmployer ? { employer_email: user.email } : { employee_email: user.email };

  const { data: appsData } = useQuery({
    queryKey,
    queryFn: () => applicationService.list({ ...queryFilter, pageSize: 20, page }),
  });
  const applications = appsData?.items || [];
  const totalPages = appsData?.totalPages || 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">{isEmployer ? "Received Applications" : "My Applications"}</h2>
        {!isEmployer && (
          <Link to="/jobs">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Briefcase className="w-4 h-4 mr-2" />Browse Jobs
            </Button>
          </Link>
        )}
      </div>
      <div className="space-y-3">
        {isEmployer ? (
          <ApplicationList applications={applications} userEmail={user.email} />
        ) : (
          applications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Send className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
              </CardContent>
            </Card>
          ) : (
            applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {statusIcons[app.status]}
                    <div>
                      <Link to={`/jobs/${app.jobId}`} className="font-medium text-sm hover:text-accent transition-colors">
                        {app.job_title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{app.company_name}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">{app.status}</Badge>
                </CardContent>
              </Card>
            ))
          )
        )}
      </div>
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
