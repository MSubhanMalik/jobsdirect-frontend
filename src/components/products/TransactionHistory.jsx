import React, { useEffect, useState } from "react";
import paymentService from "@/services/payment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IE", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
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
    <Card className="rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No transactions yet.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(tx.createdAt)}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground capitalize">{tx.reason?.replace(/_/g, " ")}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${tx.action === "credit" ? "text-emerald-600" : "text-red-600"}`}>
                        {tx.action === "credit" ? <ArrowUpCircle className="h-3.5 w-3.5" /> : <ArrowDownCircle className="h-3.5 w-3.5" />}
                        {tx.action === "credit" ? "+" : "-"}{formatCredits(tx.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatCredits(tx.balanceAfter)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
