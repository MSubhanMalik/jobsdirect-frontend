import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, AlertTriangle } from "lucide-react";
import paymentService from "@/services/payment";
import CreditBundles from "@/components/products/CreditBundles";
import SubscriptionPlans from "@/components/products/SubscriptionPlans";
import TransactionHistory from "@/components/products/TransactionHistory";

export default function BillingTab({ employer, checkoutPlanId, onCheckout, onBillingPortal }) {
  const { data: plans = [] } = useQuery({
    queryKey: ["payment-plans"],
    queryFn: () => paymentService.listPlans(),
    staleTime: 5 * 60 * 1000,
  });

  const creditBundles = plans.filter((p) => p.kind === "credits");
  const subscriptions = plans.filter((p) => p.kind === "candidate_database");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Credit balance</p>
                <p className="mt-1 text-3xl font-bold">{employer.credits || 0} <span className="text-base font-normal text-muted-foreground">credits</span></p>
              </div>
              <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Candidate database</p>
                <p className="mt-1 text-lg font-semibold">
                  {employer.candidate_database_access ? "Active" : "Not active"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {employer.creditsExpiringSoon > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Credits Expiring Soon</p>
            <p className="text-xs text-amber-700">
              {employer.creditsExpiringSoon} credit{employer.creditsExpiringSoon !== 1 ? "s" : ""} will expire within the next 30 days. Use them before they're lost.
            </p>
          </div>
        </div>
      )}

      <CreditBundles
        plans={creditBundles}
        checkoutPlanId={checkoutPlanId}
        onCheckout={onCheckout}
      />

      <SubscriptionPlans
        plans={subscriptions}
        employer={employer}
        checkoutPlanId={checkoutPlanId}
        onCheckout={onCheckout}
        onBillingPortal={onBillingPortal}
      />
      <TransactionHistory employerId={employer.id} />
    </div>
  );
}
