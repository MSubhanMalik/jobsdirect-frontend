import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import CreditBundles from "@/components/products/CreditBundles";
import SubscriptionPlans from "@/components/products/SubscriptionPlans";

export default function BillingTab({ employer, checkoutPlanId, onCheckout, onBillingPortal }) {
  const { creditBundles, subscriptions } = useProducts();

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
    </div>
  );
}
