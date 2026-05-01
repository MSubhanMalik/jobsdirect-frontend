import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import applicationService from "@/services/application";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Send, Clock, Eye, CheckCircle, XCircle, Users, Mail, Calendar } from "lucide-react";
import PaginationControls from "@/components/ui/pagination-controls";
import ApplicationList from "@/components/dashboard/employer/ApplicationList";

const statusIcons = {
  submitted: <Clock className="w-4 h-4 text-blue-500" />,
  viewed: <Eye className="w-4 h-4 text-purple-500" />,
  shortlisted: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  contacted: <Mail className="w-4 h-4 text-amber-500" />,
  interview: <Calendar className="w-4 h-4 text-indigo-500" />,
  hired: <CheckCircle className="w-4 h-4 text-green-500" />,
  rejected: <XCircle className="w-4 h-4 text-red-500" />,
  closed: <XCircle className="w-4 h-4 text-muted-foreground" />,
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
              <Card key={app.id} className="hover:border-primary/30 transition-colors group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      {statusIcons[app.status] || <Clock className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/dashboard/applications/${app.id}`} className="font-bold text-sm hover:text-primary transition-colors">
                          {app.job_title}
                        </Link>
                        <Badge variant="outline" className="text-[10px] py-0 h-4 capitalize font-normal">
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3" /> {app.company_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4 hidden sm:block">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Applied On</p>
                      <p className="text-xs font-medium">{new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/dashboard/applications/${app.id}`}>
                        View Details <Eye className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
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
