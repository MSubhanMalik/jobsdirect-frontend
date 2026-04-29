import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, CheckCircle2, MoreHorizontal, Trash2 } from "lucide-react";
import { SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatDate, humanize } from "../shared/helpers";
import { queryKeys } from "../shared/constants";
import adminService from "@/services/admin";
import { toast } from "react-toastify";

export default function AdminUsers({
  users,
  search,
  authUser,
  openEditor,
  setDeleteDialog,
  invalidate,
}) {
  const filtered = searchRecords(users, search, ["full_name", "email", "role", "id"]);

  async function toggleVerification(user) {
    try {
      await adminService.updateUser(user.id, {
        email_verified: !user.email_verified,
      });
      toast.success(user.email_verified ? "Email unverified" : "Email verified");
      invalidate(queryKeys.users);
    } catch (err) {
      toast.error("Failed to update verification");
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="User access"
        action={
          <Button onClick={() => openEditor("user")}>
            <Plus className="h-4 w-4" />
            New User
          </Button>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const isSelf = authUser?.id === user.id;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.full_name || "Unnamed"}</p>
                      <p className="max-w-xs truncate text-xs text-muted-foreground">{user.id}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {humanize(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email_verified ? "Verified" : "Unverified"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditor("user", user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleVerification(user)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {user.email_verified ? "Unverify email" : "Verify email"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            disabled={isSelf}
                            onClick={() =>
                              setDeleteDialog({ kind: "user", id: user.id, label: user.full_name || user.email })
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
