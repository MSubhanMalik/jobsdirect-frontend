import React, { useEffect, useState } from "react";
import paymentService from "@/services/payment";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, Receipt } from "lucide-react";

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IE", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(value));
}

function formatCredits(n) {
  return `${n} credit${n !== 1 ? "s" : ""}`;
}

export default function TransactionHistory({ employerId }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    paymentService.getTransactions(employerId, page)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [employerId, page]);

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">Transaction History</p>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-5 h-5 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border/30">
              {items.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    tx.action === "credit" ? "bg-emerald-50" : "bg-red-50"
                  }`}>
                    {tx.action === "credit" ? (
                      <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground capitalize">{tx.reason?.replace(/_/g, " ")}</p>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                    {formatDate(tx.createdAt)}
                  </p>

                  {/* Amount */}
                  <span className={`text-sm font-display font-bold whitespace-nowrap ${
                    tx.action === "credit" ? "text-emerald-600" : "text-red-500"
                  }`}>
                    {tx.action === "credit" ? "+" : "-"}{formatCredits(tx.amount)}
                  </span>

                  {/* Balance */}
                  <span className="text-xs text-muted-foreground font-medium whitespace-nowrap w-20 text-right hidden md:block">
                    bal: {tx.balanceAfter}
                  </span>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 py-4 border-t border-border/40">
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-9 px-3 rounded-lg font-medium text-xs">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <span className="text-xs text-muted-foreground px-3">Page {page} of {totalPages}</span>
                <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-9 px-3 rounded-lg font-medium text-xs">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
