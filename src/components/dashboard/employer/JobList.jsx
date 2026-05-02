import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import jobService from "@/services/job";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import {
  Briefcase, Plus, FileText, Clock, CheckCircle, XCircle, Eye, Trash2,
  Star, Sparkles, Send, Zap, AlertTriangle, RefreshCw, ChevronRight, MapPin, Pencil, Copy
} from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useProducts } from "@/hooks/useProducts";
import ProductIcon from "@/components/products/ProductIcon";

const statusConfig = {
  unpaid: { dot: "bg-orange-500", label: "Unpaid", variant: "destructive" },
  draft: { dot: "bg-muted-foreground", label: "Draft", variant: "secondary" },
  pending_review: { dot: "bg-amber-500", label: "Pending Review", variant: "secondary" },
  approved: { dot: "bg-emerald-500", label: "Active", variant: "default" },
  rejected: { dot: "bg-red-500", label: "Rejected", variant: "destructive" },
  expired: { dot: "bg-muted-foreground", label: "Expired", variant: "secondary" },
};

function getTimeLeft(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 1) return `${days}d left`;
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
  const [addonConfirm, setAddonConfirm] = useState(null);
  const [activatingAddon, setActivatingAddon] = useState(false);
  const [renewConfirm, setRenewConfirm] = useState(null);
  const [renewing, setRenewing] = useState(false);

  const handleRenew = async (jobId) => {
    setRenewing(true);
    try {
      await jobService.renew(jobId);
      queryClient.invalidateQueries({ queryKey: ["employer-jobs", user.email] });
      toast.success("Job renewed — submitted for review.");
    } catch (err) { toast.error(`Could not renew — ${err.message}`); }
    finally { setRenewing(false); setRenewConfirm(null); }
  };

  const { addons: addonProducts } = useProducts();
  const purchasableAddons = addonProducts.filter((a) => a.id !== "addon_import" && a.id !== "addon_duplicate");

  const handleActivateAddon = async () => {
    if (!addonConfirm) return;
    setActivatingAddon(true);
    try {
      const result = await jobService.activateAddon(addonConfirm.job.id, addonConfirm.addon.id);
      if (result.needsCheckout && result.checkoutUrl) {
        toast.info("Redirecting to payment...");
        window.location.assign(result.checkoutUrl);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["employer-jobs", user.email] });
      toast.success(`${addonConfirm.addon.name} activated!`);
    } catch (err) { toast.error(`Could not activate — ${err.message}`); }
    finally { setActivatingAddon(false); setAddonConfirm(null); }
  };

  const handleSubmitForReview = async (jobId) => {
    setSubmittingReview(jobId);
    try {
      await jobService.update(jobId, { status: "pending_review" });
      queryClient.invalidateQueries({ queryKey: ["employer-jobs", user.email] });
      toast.success("Job submitted for review.");
    } catch (err) { toast.error(`Could not submit — ${err.message}`); }
    finally { setSubmittingReview(null); }
  };

  const handleDelete = async (jobId) => {
    setDeleting(true);
    try {
      await jobService.remove(jobId);
      queryClient.invalidateQueries({ queryKey: ["employer-jobs", user.email] });
      toast.success("Job deleted.");
    } catch (err) { toast.error(`Could not delete — ${err.message}`); }
    finally { setDeleting(false); setDeleteConfirm(null); }
  };

  const handleDuplicate = async (jobId) => {
    setDuplicating(true);
    try {
      const result = await jobService.duplicate(jobId);
      if (result.needsCheckout && result.checkoutUrl) {
        toast.info("Redirecting to payment...");
        window.location.assign(result.checkoutUrl);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["employer-jobs", user.email] });
      toast.success("Job duplicated.");
    } catch (err) { toast.error(`Could not duplicate — ${err.message}`); }
    finally { setDuplicating(false); setDuplicateConfirm(null); }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            {editingJob ? "Edit Job" : "Job Listings"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{jobs.length} total listing{jobs.length !== 1 ? "s" : ""}</p>
        </div>
        <Button
          className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-5 h-9 text-sm font-medium group"
          onClick={() => { setEditingJob(null); setShowJobForm(true); }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Post a Job
        </Button>
      </div>

      {/* Job form */}
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

      {/* Job list */}
      {jobs.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-6 h-6 text-muted-foreground/25" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">No jobs posted yet</h3>
          <p className="text-sm text-muted-foreground mb-5">Create your first listing to start attracting candidates.</p>
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-10 font-medium"
            onClick={() => { setEditingJob(null); setShowJobForm(true); }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Post Your First Job
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
          {jobs.map((job) => {
            const config = statusConfig[job.status] || statusConfig.draft;
            const timeLeft = getTimeLeft(job.expires_at);
            const isExpired = timeLeft === "Expired";

            return (
              <div key={job.id} className="px-5 py-5 hover:bg-muted/20 transition-colors group">
                {/* Row 1: Main info */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
                      <h3
                        className="text-[0.95rem] font-display font-semibold text-foreground truncate cursor-pointer hover:text-accent transition-colors"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        {job.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                      <span>{job.job_type?.replace("_", " ")}</span>
                      {timeLeft && (
                        <span className={isExpired ? "text-destructive font-medium" : ""}>
                          <Clock className="w-3 h-3 inline mr-0.5" />{timeLeft}
                        </span>
                      )}
                      {job.views_count > 0 && (
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{job.views_count}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={config.variant} className="text-[0.65rem] capitalize font-medium">{config.label}</Badge>
                    {job.listing_type === "free" && <Badge variant="outline" className="text-[0.65rem]">Free</Badge>}
                  </div>
                </div>

                {/* Row 2: Addon badges */}
                {(job.is_featured || job.is_highlighted || job.is_urgent || job.is_auto_renew || job.is_imported || job.is_duplicate) && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    {job.is_featured && (
                      <Badge variant="secondary" className="text-[0.6rem] gap-1 rounded-md px-2 py-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-500" /> Featured
                      </Badge>
                    )}
                    {job.is_highlighted && (
                      <Badge variant="secondary" className="text-[0.6rem] gap-1 rounded-md px-2 py-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-blue-500" /> Highlighted
                      </Badge>
                    )}
                    {job.is_urgent && (
                      <Badge variant="secondary" className="text-[0.6rem] gap-1 rounded-md px-2 py-0.5">
                        <AlertTriangle className="w-2.5 h-2.5 text-red-500" /> Urgent
                      </Badge>
                    )}
                    {job.is_auto_renew && (
                      <Badge variant="secondary" className="text-[0.6rem] gap-1 rounded-md px-2 py-0.5">
                        <RefreshCw className="w-2.5 h-2.5 text-emerald-500" /> Auto-Renew
                      </Badge>
                    )}
                    {job.is_imported && <Badge variant="outline" className="text-[0.6rem] rounded-md px-2 py-0.5">Imported</Badge>}
                    {job.is_duplicate && <Badge variant="outline" className="text-[0.6rem] rounded-md px-2 py-0.5">Duplicate</Badge>}
                  </div>
                )}

                {/* Row 3: Actions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Primary actions based on status */}
                  {job.status === "unpaid" && (
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground h-8 text-xs rounded-lg font-medium"
                      onClick={async () => {
                        try {
                          const result = await jobService.checkout(job.id);
                          if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
                        } catch (err) { toast.error(err.message || "Could not resume checkout"); }
                      }}
                    >
                      <Zap className="w-3 h-3 mr-1" /> Complete Payment
                    </Button>
                  )}
                  {job.status === "draft" && (
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground h-8 text-xs rounded-lg font-medium"
                      disabled={submittingReview === job.id}
                      onClick={() => handleSubmitForReview(job.id)}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      {submittingReview === job.id ? "Submitting..." : "Submit for Review"}
                    </Button>
                  )}
                  {job.is_expired && (
                    <Button
                      size="sm"
                      className="bg-foreground hover:bg-foreground/90 text-background h-8 text-xs rounded-lg font-medium"
                      onClick={() => setRenewConfirm(job)}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" /> Renew
                    </Button>
                  )}

                  {/* Addon buttons */}
                  {job.status === "approved" && !job.is_expired && purchasableAddons
                    .filter((addon) => !(job.active_addons || []).some((a) => a.id === addon.id))
                    .map((addon) => (
                      <Button
                        key={addon.id}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs rounded-lg"
                        onClick={() => setAddonConfirm({ job, addon })}
                      >
                        <ProductIcon name={addon.icon} className="w-3 h-3 mr-1" />
                        + {addon.name}
                      </Button>
                    ))
                  }

                  {/* Management actions — right side */}
                  <div className="flex items-center gap-0.5 ml-auto">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => navigate(`/jobs/${job.id}`)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => { setEditingJob(job); setShowJobForm(true); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setDuplicateConfirm(job)}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(job)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!duplicateConfirm}
        title="Duplicate Job"
        description={`Duplicating "${duplicateConfirm?.title}" will create a new paid listing. Credits will be deducted or you'll be redirected to Stripe.`}
        confirmLabel={duplicating ? "Processing..." : "Duplicate & Pay"}
        onConfirm={() => handleDuplicate(duplicateConfirm.id)}
        onCancel={() => setDuplicateConfirm(null)}
        disabled={duplicating}
      />
      <ConfirmDialog
        open={!!renewConfirm}
        title="Renew Job Listing"
        description={`Renew "${renewConfirm?.title}" for another 30 days? 1 credit will be deducted.`}
        confirmLabel={renewing ? "Renewing..." : "Renew (1 credit)"}
        onConfirm={() => handleRenew(renewConfirm.id)}
        onCancel={() => setRenewConfirm(null)}
        disabled={renewing}
      />
      <ConfirmDialog
        open={!!addonConfirm}
        title={`Activate ${addonConfirm?.addon?.name}`}
        description={`Add "${addonConfirm?.addon?.name}" to "${addonConfirm?.job?.title}" for ${addonConfirm?.addon?.creditCost} credits.`}
        confirmLabel={activatingAddon ? "Activating..." : `Activate (${addonConfirm?.addon?.creditCost} credits)`}
        onConfirm={handleActivateAddon}
        onCancel={() => setAddonConfirm(null)}
        disabled={activatingAddon}
      />
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Job"
        description={`Delete "${deleteConfirm?.title}"? This cannot be undone. Credits will not be refunded.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
        disabled={deleting}
      />
    </>
  );
}
