import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, CheckCircle2, ShieldCheck, MoreHorizontal, Trash2, User, Mail } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatDate, humanize } from "../shared/helpers";
import { queryKeys } from "../shared/constants";
import PaginationControls from "@/components/ui/pagination-controls";
import adminService from "@/services/admin";

const roleConfig = {
  admin: { bg: "bg-accent/10 text-accent border-0" },
  employer: { bg: "bg-blue-50 text-blue-700 border-0" },
  employee: { bg: "bg-muted text-muted-foreground border-0" },
};

export default function AdminUsers() {
  const { search, authUser, openEditor } = useOutletContext();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [page, setPage] = useState(1);

  const usersQuery = useQuery({ queryKey: queryKeys.users, queryFn: () => adminService.listUsers() });
  const users = usersQuery.data || [];

  const filtered = searchRecords(users, search, ["full_name", "email", "role", "id"]);

  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function toggleVerification(user) {
    try {
      await adminService.updateUser(user.id, { email_verified: !user.email_verified });
      toast.success(user.email_verified ? "Email unverified" : "Email verified");
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    } catch { toast.error("Failed to update verification"); }
  }

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    try {
      await adminService.deleteUser(deleteDialog.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success(`Deleted — ${deleteDialog.label}`);
      setDeleteDialog(null);
    } catch { toast.error("Failed to delete user"); }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Users"
        description={`${users.length} registered accounts`}
        action={
          <Button onClick={() => openEditor("user")} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-5 h-9 text-sm font-medium">
            <Plus className="h-4 w-4 mr-1.5" /> New User
          </Button>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search." />
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
          {paged.map((user) => {
            const isSelf = authUser?.id === user.id;
            const rc = roleConfig[user.role] || roleConfig.employee;
            return (
              <div key={user.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  {user.role === "admin" ? (
                    <ShieldCheck className="w-5 h-5 text-accent" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground/50" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-display font-semibold text-foreground truncate">
                      {user.full_name || "Unnamed"}
                    </p>
                    {isSelf && <span className="text-[0.55rem] font-semibold text-accent uppercase tracking-wider">You</span>}
                    <Badge variant="outline" className={`text-[0.55rem] rounded-md px-1.5 py-0 h-4 ${rc.bg}`}>
                      {humanize(user.role)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>
                    <span>{user.email_verified ? "Verified" : "Unverified"}</span>
                    {user.email_verified && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </div>
                </div>

                {/* Date */}
                <span className="text-[0.65rem] text-muted-foreground whitespace-nowrap hidden md:block">
                  {formatDate(user.createdAt)}
                </span>

                {/* Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditor("user", user)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleVerification(user)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {user.email_verified ? "Unverify email" : "Verify email"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" disabled={isSelf} onClick={() => setDeleteDialog({ id: user.id, label: user.full_name || user.email })}>
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
        title="Delete this user?"
        description={deleteDialog?.label ? `"${deleteDialog.label}" will be permanently removed.` : "This user will be permanently removed."}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog(null)}
      />
    </div>
  );
}
