import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { CreditCard, BarChart3, Users, Mail, Clock, ArrowUpRight } from "lucide-react";
import { StatCard, SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatDate, formatMoneyFromCents, humanize } from "../shared/helpers";
import { queryKeys } from "../shared/constants";
import PaginationControls from "@/components/ui/pagination-controls";
import paymentService from "@/services/payment";

const STATUS_CONFIG = {
  paid: { dot: "bg-emerald-500", label: "Paid" },
  unpaid: { dot: "bg-amber-500", label: "Unpaid" },
  checkout_created: { dot: "bg-slate-400", label: "Pending" },
  no_payment_required: { dot: "bg-blue-500", label: "Free" },
};

export default function AdminPayments() {
  const { search } = useOutletContext();
  const [page, setPage] = useState(1);

  const paymentsQuery = useQuery({ queryKey: queryKeys.payments, queryFn: () => paymentService.list() });
  const payments = paymentsQuery.data || [];

  const stats = useMemo(() => {
    const paidPayments = payments.filter((p) => p.payment_status === "paid").length;
    const revenue = payments.filter((p) => p.payment_status === "paid").reduce((sum, p) => sum + (Number(p.amount_total) || 0), 0);
    const subscriptions = payments.filter((p) => p.kind === "subscription" && p.payment_status === "paid").length;
    return { paidPayments, revenue, subscriptions };
  }, [payments]);

  const filtered = searchRecords(payments, search, [
    "plan_id", "id", "customer_email", "kind",
  ]);

  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Payments"
        description="Live data from Stripe Checkout sessions."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={CreditCard}
          label="Paid sessions"
          value={stats.paidPayments}
          subtext={`${payments.length} total sessions`}
          tone="accent"
        />
        <StatCard
          icon={BarChart3}
          label="Revenue"
          value={formatMoneyFromCents(stats.revenue)}
          subtext="From paid sessions"
          tone="primary"
        />
        <StatCard
          icon={Users}
          label="Subscriptions"
          value={stats.subscriptions}
          subtext="Candidate database access"
          tone="blue"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments found" />
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
          {paged.map((payment) => {
            const statusKey = payment.payment_status || payment.status || "checkout_created";
            const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.checkout_created;
            const amount = formatMoneyFromCents(payment.amount_total, payment.currency);
            const kindLabel = humanize(payment.kind || payment.plan_id || "checkout");
            const dateStr = formatDate(payment.created_at || payment.createdAt);

            return (
              <div key={payment.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                {/* Status dot + payment info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
                    <p className="text-sm font-display font-semibold text-foreground truncate">{kindLabel}</p>
                    <Badge variant="secondary" className="text-[0.55rem] rounded-md px-1.5 py-0 h-4">{config.label}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{payment.customer_email || "No email"}</span>
                    {dateStr && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dateStr}</span>}
                  </div>
                </div>

                {/* Plan ID */}
                <div className="hidden lg:block shrink-0 max-w-[160px]">
                  <p className="text-[0.65rem] text-muted-foreground truncate" title={payment.id}>{payment.id}</p>
                </div>

                {/* Amount */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-display font-bold text-foreground">{amount}</p>
                  {payment.employer_id && (
                    <p className="text-[0.6rem] text-muted-foreground">Employer</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
