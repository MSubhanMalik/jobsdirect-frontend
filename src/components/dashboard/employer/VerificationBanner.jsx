import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ShieldAlert, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function VerificationBanner({ employer, submitting, onSubmit }) {
  const status = employer.verification_status;
  if (status === "approved") return null;

  const isPending = status === "pending" || status === "submitted";
  const isRejected = status === "rejected";

  return (
    <div className={`rounded-xl border p-5 mb-6 ${
      isRejected ? "bg-red-50 border-red-200" : isPending ? "bg-amber-50 border-amber-200" : "bg-card border-border/50"
    }`}>
      <div className="flex flex-col lg:flex-row items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isRejected ? "bg-red-100" : isPending ? "bg-amber-100" : "bg-muted"
        }`}>
          {isRejected ? <ShieldAlert className="w-5 h-5 text-red-600" /> :
           isPending ? <Clock className="w-5 h-5 text-amber-600" /> :
           <ShieldCheck className="w-5 h-5 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground">
              {isRejected ? "Verification Rejected" : isPending ? "Verification Pending" : "Verification Required"}
            </h3>
            <Badge variant="secondary" className="text-[0.6rem] capitalize">{status || "draft"}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {isRejected ? "Your account was not approved. Update your profile and resubmit."
              : isPending ? "Your account is being reviewed. This usually takes 1-2 business days."
              : "Complete your profile and submit for verification to start posting jobs."}
          </p>
          {isRejected && employer.admin_review_note && (
            <p className="text-sm text-red-700 mt-2 font-medium">Reason: {employer.admin_review_note}</p>
          )}
        </div>
        {!isPending && (
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-5 h-9 text-sm font-medium shrink-0 group"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Submitting</> :
              <>{isRejected ? "Resubmit" : "Submit for Review"}<ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" /></>}
          </Button>
        )}
      </div>
    </div>
  );
}
