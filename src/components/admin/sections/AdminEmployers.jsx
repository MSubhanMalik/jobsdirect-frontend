import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, CheckCircle2, XCircle, MoreHorizontal, Trash2, Building2, Globe, Mail } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatDate } from "../shared/helpers";
import { queryKeys } from "../shared/constants";
import PaginationControls from "@/components/ui/pagination-controls";
import employerService from "@/services/employer";

const verificationConfig = {
  approved: { dot: "bg-emerald-500", label: "Approved" },
  pending: { dot: "bg-amber-500", label: "Pending" },
  submitted: { dot: "bg-amber-500", label: "Pending" },
  rejected: { dot: "bg-red-500", label: "Rejected" },
  draft: { dot: "bg-muted-foreground", label: "Draft" },
};

export default function AdminEmployers() {
  const { search, openEditor } = useOutletContext();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [page, setPage] = useState(1);

  const employersQuery = useQuery({ queryKey: [...queryKeys.employers, page], queryFn: () => employerService.list({ pageSize: 20, page }) });
  const employers = employersQuery.data?.items || [];
  const totalPages = employersQuery.data?.totalPages || 1;
  const total = employersQuery.data?.total || 0;

  const updateEntity = async (id, updates, title) => {
    try {
      await employerService.update(id, updates);
      queryClient.invalidateQueries({ queryKey: queryKeys.employers });
      toast.success(title);
    } catch { toast.error("Failed to update company"); }
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    try {
      await employerService.remove(deleteDialog.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.employers });
      toast.success(`Deleted — ${deleteDialog.label}`);
      setDeleteDialog(null);
    } catch { toast.error("Failed to delete company"); }
  };

  const filtered = searchRecords(employers, search, ["company_name", "website", "first_name", "last_name", "user_email"]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Companies"
        description={`${total} registered companies`}
        action={
          <Button onClick={() => openEditor("employer")} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-5 h-9 text-sm font-medium">
            <Plus className="h-4 w-4 mr-1.5" /> New Company
          </Button>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title="No companies found" description="Try adjusting your search." />
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
          {filtered.map((employer) => {
            const config = verificationConfig[employer.verification_status] || verificationConfig.draft;
            return (
              <div key={employer.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-muted-foreground/50" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-display font-semibold text-foreground truncate">{employer.company_name}</p>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
                    <span className="text-[0.6rem] font-medium text-muted-foreground">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{employer.first_name} {employer.last_name}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{employer.user_email}</span>
                    {employer.website && (
                      <span className="hidden md:flex items-center gap-1"><Globe className="w-3 h-3" />{employer.website}</span>
                    )}
                  </div>
                </div>

                {/* Date */}
                <span className="text-[0.65rem] text-muted-foreground whitespace-nowrap hidden lg:block">{formatDate(employer.updatedAt)}</span>

                {/* Quick approve */}
                {["pending", "submitted"].includes(employer.verification_status) && (
                  <Button
                    variant="ghost" size="sm"
                    className="h-8 text-xs rounded-lg text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 hidden sm:flex"
                    onClick={() => updateEntity(employer.id, { verification_status: "approved", approved_at: new Date().toISOString() }, "Company approved")}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                  </Button>
                )}

                {/* Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditor("employer", employer)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    {employer.verification_status !== "approved" && (
                      <DropdownMenuItem onClick={() => updateEntity(employer.id, { verification_status: "approved", approved_at: new Date().toISOString() }, "Company approved")}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                      </DropdownMenuItem>
                    )}
                    {employer.verification_status !== "rejected" && (
                      <DropdownMenuItem onClick={() => updateEntity(employer.id, { verification_status: "rejected" }, "Company rejected")}>
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleteDialog({ id: employer.id, label: employer.company_name })}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!deleteDialog}
        title="Delete this company?"
        description={deleteDialog?.label ? `"${deleteDialog.label}" will be permanently removed.` : "This company will be permanently removed."}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog(null)}
      />
    </div>
  );
}
