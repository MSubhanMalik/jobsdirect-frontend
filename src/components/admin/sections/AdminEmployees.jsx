import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Eye, EyeOff, MoreHorizontal, Trash2, User, MapPin, Briefcase } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, splitList } from "../shared/helpers";
import { queryKeys } from "../shared/constants";
import PaginationControls from "@/components/ui/pagination-controls";
import employeeService from "@/services/employee";

export default function AdminEmployees() {
  const { search, openEditor } = useOutletContext();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [page, setPage] = useState(1);

  const employeesQuery = useQuery({ queryKey: [...queryKeys.employees, page], queryFn: () => employeeService.list({ pageSize: 20, page }) });
  const employees = employeesQuery.data?.items || [];
  const totalPages = employeesQuery.data?.totalPages || 1;
  const total = employeesQuery.data?.total || 0;

  const updateEntity = async (id, updates, title) => {
    try {
      await employeeService.update(id, updates);
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
      toast.success(title);
    } catch { toast.error("Failed to update candidate"); }
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    try {
      await employeeService.remove(deleteDialog.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
      toast.success(`Deleted — ${deleteDialog.label}`);
      setDeleteDialog(null);
    } catch { toast.error("Failed to delete candidate"); }
  };

  const filtered = searchRecords(employees, search, ["first_name", "last_name", "user_email", "title", "location"]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Candidates"
        description={`${total} registered candidates`}
        action={
          <Button onClick={() => openEditor("employee")} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-5 h-9 text-sm font-medium">
            <Plus className="h-4 w-4 mr-1.5" /> New Candidate
          </Button>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title="No candidates found" description="Try adjusting your search." />
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
          {filtered.map((emp) => {
            const skills = splitList(emp.skills);
            const name = [emp.first_name, emp.last_name].filter(Boolean).join(" ") || "Unnamed";
            return (
              <div key={emp.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-muted-foreground/50" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-display font-semibold text-foreground truncate">{name}</p>
                    {emp.is_searchable && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Visible" />}
                    {emp.profile_completed ? (
                      <Badge variant="secondary" className="text-[0.55rem] rounded-md px-1.5 py-0 h-4 bg-emerald-50 text-emerald-700 border-0">Complete</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[0.55rem] rounded-md px-1.5 py-0 h-4">Incomplete</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {emp.title && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{emp.title}</span>}
                    {(emp.location || emp.desired_location) && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{emp.location || emp.desired_location}</span>
                    )}
                    <span>{emp.user_email}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="hidden lg:flex items-center gap-1 shrink-0 max-w-[200px]">
                  {skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-[0.6rem] rounded-md px-2 py-0.5 bg-muted/70 shrink-0">{skill}</Badge>
                  ))}
                  {skills.length > 3 && <span className="text-[0.6rem] text-muted-foreground">+{skills.length - 3}</span>}
                </div>

                {/* Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditor("employee", emp)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateEntity(emp.id, { is_searchable: !emp.is_searchable }, emp.is_searchable ? "Candidate hidden" : "Candidate visible")}>
                      {emp.is_searchable ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                      {emp.is_searchable ? "Hide profile" : "Show profile"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleteDialog({ id: emp.id, label: name })}>
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
        title="Delete this candidate?"
        description={deleteDialog?.label ? `"${deleteDialog.label}" will be permanently removed.` : "This candidate will be permanently removed."}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog(null)}
      />
    </div>
  );
}
