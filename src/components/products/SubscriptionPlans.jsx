import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";

function formatPlanPrice(plan) {
  const amount = Number(plan.amount || 0) / 100;
  const formatted = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: String(plan.currency || "eur").toUpperCase(),
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
  return plan.interval ? `${formatted}/${plan.interval}` : formatted;
}

export default function SubscriptionPlans({ plans, employer, checkoutPlanId, onCheckout, onBillingPortal }) {
  if (!plans.length) return null;

  const hasSubscription = employer.candidate_database_access;
  const currentPlanId = employer.candidate_database_status;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">CV Database Subscription</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const isThisPlan = currentPlanId === plan.id;
          return (
            <Card key={plan.id} className={isThisPlan ? "border-primary" : ""}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{plan.name || plan.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  {isThisPlan && <Badge>Current Plan</Badge>}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xl font-bold">{formatPlanPrice(plan)}</span>
                  {isThisPlan ? (
                    <Button
                      variant="outline"
                      onClick={() => onBillingPortal()}
                      disabled={Boolean(checkoutPlanId)}
                    >
                      {checkoutPlanId === "portal" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                      Manage
                    </Button>
                  ) : (
                    <Button
                      onClick={() => hasSubscription ? onBillingPortal() : onCheckout(plan.id)}
                      disabled={Boolean(checkoutPlanId)}
                    >
                      {checkoutPlanId === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                      {hasSubscription ? "Switch" : "Subscribe"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
