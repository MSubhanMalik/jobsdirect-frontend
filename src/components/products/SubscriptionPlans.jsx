import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Loader2, ArrowRight, Settings } from "lucide-react";

function formatPlanPrice(plan) {
  const amount = Number(plan.amount || 0) / 100;
  if (amount === 0) return "Free";
  const formatted = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: String(plan.currency || "eur").toUpperCase(),
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
  return formatted;
}

export default function SubscriptionPlans({ plans, employer, checkoutPlanId, onCheckout, onBillingPortal }) {
  if (!plans.length) return null;

  const hasSubscription = employer.candidate_database_access;
  const currentPlanId = employer.candidate_database_status;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">Subscriptions</p>
      <div className="grid gap-3 md:grid-cols-2">
        {plans.map((plan) => {
          const isThisPlan = currentPlanId === plan.id;
          const loading = checkoutPlanId === plan.id || (isThisPlan && checkoutPlanId === "portal");

          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-5 flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                isThisPlan ? "border-accent bg-accent/[0.03]" : "border-border/50 bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isThisPlan ? "bg-accent/10" : "bg-muted"
                  }`}>
                    <Database className={`w-5 h-5 ${isThisPlan ? "text-accent" : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-display font-bold text-foreground">{plan.name || plan.label}</p>
                    {plan.interval && (
                      <p className="text-[0.65rem] text-muted-foreground">Billed {plan.interval}ly</p>
                    )}
                  </div>
                </div>
                {isThisPlan && (
                  <Badge className="text-[0.6rem] bg-accent/10 text-accent border-0 shrink-0">Active</Badge>
                )}
              </div>

              {plan.description && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{plan.description}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                <div>
                  <span className="text-xl font-display font-bold text-foreground">{formatPlanPrice(plan)}</span>
                  {plan.interval && (
                    <span className="text-sm text-muted-foreground ml-1">/{plan.interval}</span>
                  )}
                </div>
                {isThisPlan ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-9 text-xs font-medium"
                    onClick={() => onBillingPortal()}
                    disabled={Boolean(checkoutPlanId)}
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Settings className="w-3.5 h-3.5 mr-1" /> Manage</>}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg h-9 text-xs font-medium"
                    onClick={() => hasSubscription ? onBillingPortal() : onCheckout(plan.id)}
                    disabled={Boolean(checkoutPlanId)}
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>{hasSubscription ? "Switch" : "Subscribe"} <ArrowRight className="w-3 h-3 ml-1" /></>}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
