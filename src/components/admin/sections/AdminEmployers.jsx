import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, CheckCircle2, XCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { StatusBadge, SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatDate } from "../shared/helpers";
import { queryKeys } from "../shared/constants";

export default function AdminEmployers({
  employers,
  search,
  openEditor,
  updateEntity,
  setDeleteDialog,
}) {
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
                              "Employer",
                              employer.id,
                              { verification_status: "approved", approved_at: new Date().toISOString() },
                              [queryKeys.employers],
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
                              "Employer",
                              employer.id,
                              { verification_status: "rejected" },
                              [queryKeys.employers],
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
                            setDeleteDialog({ entity: "Employer", id: employer.id, label: employer.company_name, keys: [queryKeys.employers] })
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
    </div>
  );
}
