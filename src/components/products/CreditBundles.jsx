import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";

function formatPlanPrice(plan) {
  const amount = Number(plan.amount || 0) / 100;
  const formatted = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: String(plan.currency || "eur").toUpperCase(),
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
  return formatted;
}

export default function CreditBundles({ plans, checkoutPlanId, onCheckout }) {
  if (!plans.length) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Buy credits</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="font-semibold">{plan.name || plan.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-bold">{plan.amount ? formatPlanPrice(plan) : `${plan.credits} credits`}</span>
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
  );
}
