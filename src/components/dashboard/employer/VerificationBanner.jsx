import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ShieldAlert } from "lucide-react";

function getVerificationMeta(employer) {
  switch (employer.verification_status) {
    case "approved":
      return { label: "Approved", description: "Your employer account is verified. Full access is unlocked." };
    case "pending":
    case "submitted":
      return { label: "Pending Review", description: "Your verification request is with the admin team. You can continue reviewing your dashboard and profile while you wait." };
    case "rejected":
      return { label: "Rejected", description: employer.admin_review_note || "Your submission needs updates before approval. Review the reason below, update your profile, and resubmit." };
    default:
      return { label: "Not Submitted", description: "Complete your company profile, then submit your account for admin verification." };
  }
}

export default function VerificationBanner({ employer, submitting, onSubmit }) {
  const meta = getVerificationMeta(employer);
  const isPending = employer.verification_status === "pending" || employer.verification_status === "submitted";

  return (
    <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5">
      <CardContent className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          {employer.verification_status === "rejected" ? (
            <ShieldAlert className="w-5 h-5 text-destructive mt-0.5" />
          ) : (
            <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">Verification Status</p>
              <Badge variant="secondary" className="capitalize">{meta.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
            {employer.verification_status === "rejected" && employer.admin_review_note && (
              <p className="text-sm text-destructive">Reason: {employer.admin_review_note}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Limited mode allows dashboard access and profile setup only. Posting jobs and employee database access stay locked until admin approval.
            </p>
          </div>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={onSubmit}
          disabled={submitting || isPending}
        >
          {submitting
            ? "Submitting..."
            : employer.verification_status === "rejected"
              ? "Resubmit for Verification"
              : isPending
                ? "Pending Admin Review"
                : "Submit for Verification"}
        </Button>
      </CardContent>
    </Card>
  );
}
