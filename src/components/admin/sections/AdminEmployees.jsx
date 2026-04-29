import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, splitList } from "../shared/helpers";
import { queryKeys } from "../shared/constants";

export default function AdminEmployees({
  employees,
  search,
  openEditor,
  updateEntity,
  setDeleteDialog,
}) {
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
                                "Employee",
                                emp.id,
                                { is_searchable: !emp.is_searchable },
                                [queryKeys.employees],
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
                                entity: "Employee",
                                id: emp.id,
                                label: [emp.first_name, emp.last_name].filter(Boolean).join(" ") || emp.user_email,
                                keys: [queryKeys.employees],
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
    </div>
  );
}
