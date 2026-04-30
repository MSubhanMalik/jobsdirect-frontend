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

export default function BillingTab({ employer, creditPlans, subscriptionPlans, checkoutPlanId, onCheckout, onBillingPortal }) {
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
              <Badge variant={employer.candidate_database_access ? "default" : "secondary"}>
                {employer.candidate_database_status || "inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Buy credits</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {creditPlans.map((plan) => (
            <Card key={plan.id}>
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="font-semibold">{plan.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xl font-bold">{formatPlanPrice(plan)}</span>
                  <Button onClick={() => onCheckout(plan.id)} disabled={Boolean(checkoutPlanId)}>
                    {checkoutPlanId === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    Buy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">CV Database Subscription</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {subscriptionPlans.map((plan) => {
            const hasSubscription = employer.candidate_database_access;
            const isThisPlan = employer.candidate_database_status === plan.id;
            return (
              <Card key={plan.id} className={isThisPlan ? "border-primary" : ""}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{plan.label}</p>
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
    </div>
  );
}
