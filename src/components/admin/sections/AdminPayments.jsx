import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CreditCard, BarChart3, Users } from "lucide-react";
import { StatusBadge, StatCard, SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatDate, formatMoneyFromCents, humanize } from "../shared/helpers";
import { queryKeys } from "../shared/constants";
import PaginationControls from "@/components/ui/pagination-controls";
import paymentService from "@/services/payment";

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
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <p className="font-medium">{humanize(payment.plan_id || payment.kind || "checkout")}</p>
                    <p className="max-w-xs truncate text-xs text-muted-foreground">{payment.id}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{payment.customer_email || "No email"}</p>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatMoneyFromCents(payment.amount_total, payment.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={payment.payment_status || payment.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(payment.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
