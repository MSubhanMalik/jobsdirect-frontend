import React, { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import jobService from "@/services/job";
import JobList from "@/components/dashboard/employer/JobList";
import JobPostForm from "@/components/dashboard/JobPostForm";
import PaginationControls from "@/components/ui/pagination-controls";

export default function DashboardJobs() {
  const { user, employer } = useOutletContext();
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [page, setPage] = useState(1);
  const formContainerRef = useRef(null);
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ["employer-jobs", user.email, page],
    queryFn: () => jobService.list({ created_by: user.email, pageSize: 20, page }),
  });
  const jobs = jobsQuery.data?.items || [];
  const totalPages = jobsQuery.data?.totalPages || 1;

  return (
    <>
      <JobList
        jobs={jobs}
        user={user}
        employer={employer}
        showJobForm={showJobForm}
        editingJob={editingJob}
        setShowJobForm={setShowJobForm}
        setEditingJob={setEditingJob}
        formContainerRef={formContainerRef}
        JobPostForm={JobPostForm}
      />
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}
