import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationControls({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="w-4 h-4" /> Prev
      </Button>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let num;
          if (totalPages <= 5) num = i + 1;
          else if (page <= 3) num = i + 1;
          else if (page >= totalPages - 2) num = totalPages - 4 + i;
          else num = page - 2 + i;
          return (
            <Button key={num} variant={page === num ? "default" : "outline"} size="sm" className="w-9" onClick={() => onPageChange(num)}>
              {num}
            </Button>
          );
        })}
      </div>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
