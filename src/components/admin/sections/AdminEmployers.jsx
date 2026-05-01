import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, CheckCircle2, XCircle, MoreHorizontal, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { StatusBadge, SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatDate } from "../shared/helpers";
import { queryKeys } from "../shared/constants";
import PaginationControls from "@/components/ui/pagination-controls";
import employerService from "@/services/employer";

export default function AdminEmployers() {
  const { search, openEditor } = useOutletContext();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [page, setPage] = useState(1);

  const employersQuery = useQuery({ queryKey: [...queryKeys.employers, page], queryFn: () => employerService.list({ pageSize: 20, page }) });
  const employers = employersQuery.data?.items || [];
  const totalPages = employersQuery.data?.totalPages || 1;

  const updateEntity = async (id, updates, title) => {
    try {
      await employerService.update(id, updates);
      queryClient.invalidateQueries({ queryKey: queryKeys.employers });
      toast.success(title);
    } catch (err) {
      toast.error("Failed to update company");
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    try {
      await employerService.remove(deleteDialog.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.employers });
      toast.success(`Deleted — ${deleteDialog.label}`);
      setDeleteDialog(null);
    } catch (err) {
      toast.error("Failed to delete company");
    }
  };

  const filtered = searchRecords(employers, search, [
    "company_name", "website", "first_name", "last_name", "user_email",
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Company CMS"
        action={
          <Button onClick={() => openEditor("employer")}>
            <Plus className="h-4 w-4" />
            New Company
          </Button>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title="No companies found" description="Try adjusting your search." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((employer) => (
                <TableRow key={employer.id}>
                  <TableCell>
                    <p className="font-medium">{employer.company_name}</p>
                    <p className="text-xs text-muted-foreground">{employer.website || "No website"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{employer.first_name} {employer.last_name}</p>
                    <p className="text-xs text-muted-foreground">{employer.user_email}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={employer.verification_status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(employer.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditor("employer", employer)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateEntity(
                              employer.id,
                              { verification_status: "approved", approved_at: new Date().toISOString() },
                              "Company approved",
                            )
                          }
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateEntity(
                              employer.id,
                              { verification_status: "rejected" },
                              "Company rejected",
                            )
                          }
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            setDeleteDialog({ id: employer.id, label: employer.company_name })
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!deleteDialog}
        title="Delete this record?"
        description={deleteDialog?.label ? `"${deleteDialog.label}" will be removed from the CMS.` : "This record will be removed from the CMS."}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog(null)}
      />
    </div>
  );
}
