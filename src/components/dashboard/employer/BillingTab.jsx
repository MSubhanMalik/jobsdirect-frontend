import React from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, AlertTriangle, Database, Wallet } from "lucide-react";
import paymentService from "@/services/payment";
import CreditBundles from "@/components/products/CreditBundles";
import SubscriptionPlans from "@/components/products/SubscriptionPlans";
import TransactionHistory from "@/components/products/TransactionHistory";

export default function BillingTab({ employer, setEmployer, checkoutPlanId, onCheckout, onBillingPortal }) {
  const { data: plans = [] } = useQuery({
    queryKey: ["payment-plans"],
    queryFn: () => paymentService.listPlans(),
    staleTime: 5 * 60 * 1000,
  });

  // Refresh balance every time the billing tab is viewed
  const { data: balance } = useQuery({
    queryKey: ["employer-balance-billing", employer?.id],
    queryFn: () => paymentService.getBalance(employer?.id),
    enabled: !!employer?.id,
    staleTime: 0,
  });

  React.useEffect(() => {
    if (!balance) return;
    const updates = {};
    if (balance.credits !== undefined && balance.credits !== employer.credits) updates.credits = balance.credits;
    if (balance.candidate_database_access !== undefined && balance.candidate_database_access !== employer.candidate_database_access) updates.candidate_database_access = balance.candidate_database_access;
    if (balance.candidate_database_status && balance.candidate_database_status !== employer.candidate_database_status) updates.candidate_database_status = balance.candidate_database_status;
    if (balance.credits_expiring_soon !== undefined) updates.credits_expiring_soon = balance.credits_expiring_soon;
    if (Object.keys(updates).length && setEmployer) setEmployer((prev) => ({ ...prev, ...updates }));
  }, [balance]);

  const creditBundles = plans.filter((p) => p.kind === "credits");
  const subscriptions = plans.filter((p) => p.kind === "candidate_database");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground">Billing & Credits</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your credits, subscriptions, and payment history.</p>
      </div>

      {/* Balance cards */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Credit Balance</p>
              <p className="mt-2 text-3xl font-display font-bold text-foreground">
                {employer.credits || 0}
                <span className="text-base font-normal text-muted-foreground ml-1.5">credits</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-accent/[0.08] flex items-center justify-center">
              <Wallet className="w-5 h-5 text-accent" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Candidate Database</p>
              <p className="mt-2 text-lg font-display font-semibold text-foreground">
                {employer.candidate_database_access ? (
                  <span className="text-emerald-600">Active</span>
                ) : (
                  <span className="text-muted-foreground">Not active</span>
                )}
              </p>
              {employer.candidate_database_status && (
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{employer.candidate_database_status.replace(/_/g, " ")}</p>
              )}
            </div>
            <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
              <Database className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Expiring credits warning */}
      {employer.credits_expiring_soon > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">Credits Expiring Soon</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {employer.credits_expiring_soon} credit{employer.credits_expiring_soon !== 1 ? "s" : ""} will expire within 30 days. Use them before they're lost.
            </p>
          </div>
        </div>
      )}

      {/* Credit bundles */}
      <CreditBundles
        plans={creditBundles}
        checkoutPlanId={checkoutPlanId}
        onCheckout={onCheckout}
      />

      {/* Subscriptions */}
      <SubscriptionPlans
        plans={subscriptions}
        employer={employer}
        checkoutPlanId={checkoutPlanId}
        onCheckout={onCheckout}
        onBillingPortal={onBillingPortal}
      />

      {/* Transaction history */}
      <TransactionHistory employerId={employer.id} />
    </div>
  );
}
