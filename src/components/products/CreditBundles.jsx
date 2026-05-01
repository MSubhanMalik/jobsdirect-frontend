import React from "react";
import { Button } from "@/components/ui/button";
import { Package, Loader2, ArrowRight } from "lucide-react";

function formatPlanPrice(plan) {
  const amount = Number(plan.amount || 0) / 100;
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: String(plan.currency || "eur").toUpperCase(),
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export default function CreditBundles({ plans, checkoutPlanId, onCheckout }) {
  if (!plans.length) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">Credit Bundles</p>
      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((plan) => {
          const loading = checkoutPlanId === plan.id;
          return (
            <div key={plan.id} className="rounded-xl border border-border/50 bg-card p-5 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/[0.08] flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-display font-bold text-foreground">{plan.name || plan.label}</p>
                  {plan.credits && (
                    <p className="text-[0.65rem] text-muted-foreground">{plan.credits} credits</p>
                  )}
                </div>
              </div>

              {plan.description && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{plan.description}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                <span className="text-xl font-display font-bold text-foreground">
                  {plan.amount ? formatPlanPrice(plan) : "Free"}
                </span>
                <Button
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg h-9 text-xs font-medium group"
                  onClick={() => onCheckout(plan.id)}
                  disabled={Boolean(checkoutPlanId)}
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>Buy <ArrowRight className="w-3 h-3 ml-1" /></>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
