import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import jobService from "@/services/job";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { Briefcase, Plus, FileText, Clock, CheckCircle, XCircle, Eye, Trash2, Star, Sparkles, Send, Zap, AlertTriangle, RefreshCw } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useProducts } from "@/hooks/useProducts";
import ProductIcon from "@/components/products/ProductIcon";

const statusIcons = {
  draft: <FileText className="w-4 h-4" />,
  pending_review: <Clock className="w-4 h-4 text-yellow-500" />,
  approved: <CheckCircle className="w-4 h-4 text-accent" />,
  rejected: <XCircle className="w-4 h-4 text-destructive" />,
  expired: <Clock className="w-4 h-4 text-muted-foreground" />,
};

function getTimeLeft(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 1) return `${days} days left`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h left`;
  return "< 1h left";
}

export default function JobList({ jobs, user, employer, showJobForm, editingJob, setShowJobForm, setEditingJob, formContainerRef, JobPostForm }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [duplicateConfirm, setDuplicateConfirm] = useState(null);
  const [duplicating, setDuplicating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(null);
  const [addonConfirm, setAddonConfirm] = useState(null); // { job, addon }
  const [activatingAddon, setActivatingAddon] = useState(false);
  const [renewConfirm, setRenewConfirm] = useState(null);
  const [renewing, setRenewing] = useState(false);

  const handleRenew = async (jobId) => {
    setRenewing(true);
    try {
      await jobService.renew(jobId);
      queryClient.invalidateQueries({ queryKey: ["employer-jobs", user.email] });
      toast.success("Job renewed — submitted for review.");
    } catch (err) {
      toast.error(`Could not renew — ${err.message}`);
    } finally {
      setRenewing(false);
      setRenewConfirm(null);
    }
  };
  const { addons: addonProducts } = useProducts();

  // Addons that can be activated post-publish (exclude import, duplicate)
  const purchasableAddons = addonProducts.filter((a) => a.id !== "addon_import" && a.id !== "addon_duplicate");

  const handleActivateAddon = async () => {
    if (!addonConfirm) return;
    setActivatingAddon(true);
    try {
      await jobService.activateAddon(addonConfirm.job.id, addonConfirm.addon.id);
      queryClient.invalidateQueries({ queryKey: ["employer-jobs", user.email] });
      toast.success(`${addonConfirm.addon.name} activated! ${addonConfirm.addon.creditCost} credits deducted.`);
    } catch (err) {
      toast.error(`Could not activate — ${err.message}`);
    } finally {
      setActivatingAddon(false);
      setAddonConfirm(null);
    }
  };

  const handleSubmitForReview = async (jobId) => {
    setSubmittingReview(jobId);
    try {
      await jobService.update(jobId, { status: "pending_review" });
      queryClient.invalidateQueries({ queryKey: ["employer-jobs", user.email] });
      toast.success("Job submitted for review.");
    } catch (err) {
      toast.error(`Could not submit — ${err.message}`);
    } finally {
      setSubmittingReview(null);
    }
  };

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
          jobs.map((job) => {
            const timeLeft = getTimeLeft(job.expires_at);
            return (
              <Card key={job.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 space-y-3">
                  {/* Row 1: Title + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {statusIcons[job.status]}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.location} · {job.job_type?.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={job.status === "approved" ? "default" : "secondary"} className="text-xs">
                        {job.status?.replace("_", " ")}
                      </Badge>
                      {job.listing_type === "free" && <Badge variant="outline" className="text-xs">Free</Badge>}
                    </div>
                  </div>

                  {/* Row 2: Addons + Time Left */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.is_featured && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Star className="w-3 h-3 text-amber-500" /> Featured
                      </Badge>
                    )}
                    {job.is_highlighted && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Sparkles className="w-3 h-3 text-blue-500" /> Highlighted
                      </Badge>
                    )}
                    {job.is_imported && (
                      <Badge variant="outline" className="text-xs">Imported</Badge>
                    )}
                    {job.is_duplicate && (
                      <Badge variant="outline" className="text-xs">Duplicate</Badge>
                    )}
                    {job.is_urgent && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" /> Urgent
                      </Badge>
                    )}
                    {job.is_auto_renew && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <RefreshCw className="w-3 h-3 text-green-500" /> Auto-Renew
                      </Badge>
                    )}
                    {timeLeft && (
                      <span className={`text-xs font-medium ${timeLeft === "Expired" ? "text-destructive" : "text-muted-foreground"}`}>
                        <Clock className="w-3 h-3 inline mr-0.5" />{timeLeft}
                      </span>
                    )}
                    {job.credits_charged > 0 && (
                      <span className="text-xs text-muted-foreground">{job.credits_charged} credits charged</span>
                    )}
                  </div>

                  {/* Row 3: Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.status === "draft" && (
                      <Button
                        size="sm"
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                        disabled={submittingReview === job.id}
                        onClick={() => handleSubmitForReview(job.id)}
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        {submittingReview === job.id ? "Submitting..." : "Submit for Review"}
                      </Button>
                    )}
                    {job.is_expired && (
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setRenewConfirm(job)}
                      >
                        <Zap className="w-3.5 h-3.5 mr-1" />
                        Renew
                      </Button>
                    )}
                    {/* Addon purchase buttons — only for approved, non-expired jobs */}
                    {job.status === "approved" && !job.is_expired && purchasableAddons
                      .filter((addon) => !(job.active_addons || []).some((a) => a.id === addon.id))
                      .map((addon) => (
                        <Button
                          key={addon.id}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => setAddonConfirm({ job, addon })}
                        >
                          <ProductIcon name={addon.icon} className="w-3 h-3 mr-1" />
                          + {addon.name}
                        </Button>
                      ))
                    }
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/jobs/${job.id}`)}>View</Button>
                    <Button variant="outline" size="sm" onClick={() => { setEditingJob(job); setShowJobForm(true); }}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDuplicateConfirm(job)}>Duplicate</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(job)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    {job.views_count > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                        <Eye className="w-3 h-3" />{job.views_count} views
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
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
        open={!!renewConfirm}
        title="Renew Job Listing"
        description={`Renew "${renewConfirm?.title}" for another 30 days? 1 credit will be deducted and the job will be re-submitted for review.`}
        confirmLabel={renewing ? "Renewing..." : "Renew (1 credit)"}
        onConfirm={() => handleRenew(renewConfirm.id)}
        onCancel={() => setRenewConfirm(null)}
        disabled={renewing}
      />

      <ConfirmDialog
        open={!!addonConfirm}
        title={`Activate ${addonConfirm?.addon?.name}`}
        description={`Add "${addonConfirm?.addon?.name}" to "${addonConfirm?.job?.title}" for ${addonConfirm?.addon?.creditCost} credits. This will be deducted from your balance.`}
        confirmLabel={activatingAddon ? "Activating..." : `Activate (${addonConfirm?.addon?.creditCost} credits)`}
        onConfirm={handleActivateAddon}
        onCancel={() => setAddonConfirm(null)}
        disabled={activatingAddon}
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
