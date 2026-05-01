import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Eye, MoreHorizontal, Trash2 } from "lucide-react";
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

  const updateEntity = async (id, updates, title) => {
    try {
      await employeeService.update(id, updates);
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
      toast.success(title);
    } catch (err) {
      toast.error("Failed to update candidate");
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    try {
      await employeeService.remove(deleteDialog.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
      toast.success(`Deleted — ${deleteDialog.label}`);
      setDeleteDialog(null);
    } catch (err) {
      toast.error("Failed to delete candidate");
    }
  };

  const filtered = searchRecords(employees, search, [
    "first_name", "last_name", "user_email", "title", "location",
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Candidate CMS"
        action={
          <Button onClick={() => openEditor("employee")}>
            <Plus className="h-4 w-4" />
            New Candidate
          </Button>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title="No candidates found" description="Try adjusting your search." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => {
                const skills = splitList(emp.skills);
                return (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <p className="font-medium">
                        {[emp.first_name, emp.last_name].filter(Boolean).join(" ") || "Unnamed"}
                      </p>
                      <p className="text-xs text-muted-foreground">{emp.user_email}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{emp.title || "Not set"}</p>
                      <p className="text-xs text-muted-foreground">{emp.location || emp.desired_location || "No location"}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{skills.length - 4}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          emp.profile_completed
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }
                      >
                        {emp.profile_completed ? "Complete" : "Incomplete"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditor("employee", emp)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateEntity(
                                emp.id,
                                { is_searchable: !emp.is_searchable },
                                emp.is_searchable ? "Candidate hidden" : "Candidate visible",
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {emp.is_searchable ? "Hide profile" : "Show profile"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              setDeleteDialog({
                                id: emp.id,
                                label: [emp.first_name, emp.last_name].filter(Boolean).join(" ") || emp.user_email,
                              })
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
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
