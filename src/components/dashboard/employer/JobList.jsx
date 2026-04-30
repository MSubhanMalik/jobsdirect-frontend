import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import jobService from "@/services/job";
import productService from "@/services/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { Briefcase, Plus, FileText, Clock, CheckCircle, XCircle, Eye, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const statusIcons = {
  draft: <FileText className="w-4 h-4" />,
  pending_review: <Clock className="w-4 h-4 text-yellow-500" />,
  approved: <CheckCircle className="w-4 h-4 text-accent" />,
  rejected: <XCircle className="w-4 h-4 text-destructive" />,
  expired: <Clock className="w-4 h-4 text-muted-foreground" />,
};

export default function JobList({ jobs, user, employer, showJobForm, editingJob, setShowJobForm, setEditingJob, formContainerRef, JobPostForm }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [duplicateConfirm, setDuplicateConfirm] = useState(null);
  const [duplicating, setDuplicating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (jobId) => {
    setDeleting(true);
    try {
      await jobService.remove(jobId);
      queryClient.invalidateQueries({ queryKey: ["employer-jobs", user.email] });
      toast.success("Job deleted.");
    } catch (err) {
      toast.error(`Could not delete — ${err.message}`);
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleDuplicate = async (jobId) => {
    setDuplicating(true);
    try {
      const result = await jobService.duplicate(jobId);
      if (result.needsCheckout && result.checkoutUrl) {
        toast.info("Redirecting to payment for duplicate...");
        window.location.assign(result.checkoutUrl);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["employer-jobs", user.email] });
      toast.success("Job duplicated — credits deducted, submitted for review.");
    } catch (err) {
      toast.error(`Could not duplicate — ${err.message}`);
    } finally {
      setDuplicating(false);
      setDuplicateConfirm(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">{editingJob ? "Edit Job" : "Job Listings"}</h2>
        <Button
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={() => { setEditingJob(null); setShowJobForm(true); }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Post a Job
        </Button>
      </div>

      {showJobForm && (
        <div className="mb-6" ref={formContainerRef}>
          <JobPostForm
            employer={employer}
            user={user}
            initialJob={editingJob}
            autoFocusTitle={Boolean(editingJob)}
            onClose={() => { setShowJobForm(false); setEditingJob(null); }}
            onSuccess={() => {
              setShowJobForm(false);
              setEditingJob(null);
              queryClient.invalidateQueries({ queryKey: ["employer-jobs", user.email] });
            }}
          />
        </div>
      )}

      <div className="space-y-3">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No jobs posted yet. Create your first listing.</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusIcons[job.status]}
                  <div>
                    <p className="font-medium text-sm">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.location} · {job.job_type?.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={job.status === "approved" ? "default" : "secondary"} className="text-xs">
                    {job.status?.replace("_", " ")}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/jobs/${job.id}`)}>View</Button>
                  <Button variant="outline" size="sm" onClick={() => { setEditingJob(job); setShowJobForm(true); }}>Edit</Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDuplicateConfirm(job)}
                  >
                    Duplicate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirm(job)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {job.views_count || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!duplicateConfirm}
        title="Duplicate Job"
        description={`Duplicating "${duplicateConfirm?.title}" will create a new paid listing. Credits for listing + duplicate add-on will be deducted, or you'll be redirected to Stripe.`}
        confirmLabel={duplicating ? "Processing..." : "Duplicate & Pay"}
        onConfirm={() => handleDuplicate(duplicateConfirm.id)}
        onCancel={() => setDuplicateConfirm(null)}
        disabled={duplicating}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Job"
        description={`Are you sure you want to delete "${deleteConfirm?.title}"? This cannot be undone. Credits will not be refunded.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
        disabled={deleting}
      />
    </>
  );
}
