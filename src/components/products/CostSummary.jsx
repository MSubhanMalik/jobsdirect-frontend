import React from "react";

export default function CostSummary({ costEstimate, creditBalance }) {
  if (!costEstimate) return null;

  const sufficient = creditBalance >= costEstimate.total;

  return (
    <div className="rounded-md bg-white border border-slate-200 px-3 py-2 space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{costEstimate.listing?.name || "Job Listing"}</span>
        <span>{costEstimate.listing?.credit_cost || 0} credits</span>
      </div>
      {(costEstimate.addons || []).map((a) => (
        <div key={a.id} className="flex items-center justify-between text-xs text-muted-foreground">
          <span>+ {a.name}</span>
          <span>{a.credit_cost} credits</span>
        </div>
      ))}
      <div className="flex items-center justify-between font-bold border-t border-slate-100 pt-1 mt-1">
        <span className="text-sm">Total</span>
        <span className="text-base">{costEstimate.total} credits</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {sufficient
          ? `Will be deducted from your balance (${creditBalance} credits available)`
          : "You'll be redirected to Stripe checkout."}
      </p>
    </div>
  );
}
