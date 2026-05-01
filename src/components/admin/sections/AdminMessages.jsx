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
import { CheckCircle2, FileText, MoreHorizontal, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { StatusBadge, SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatDate } from "../shared/helpers";
import { queryKeys } from "../shared/constants";
import PaginationControls from "@/components/ui/pagination-controls";
import contactService from "@/services/contact";

export default function AdminMessages() {
  const { search } = useOutletContext();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [page, setPage] = useState(1);

  const messagesQuery = useQuery({ queryKey: queryKeys.messages, queryFn: () => contactService.list() });
  const messages = messagesQuery.data || [];

  const updateEntity = async (id, updates, title) => {
    try {
      await contactService.update(id, updates);
      queryClient.invalidateQueries({ queryKey: queryKeys.messages });
      toast.success(title);
    } catch (err) {
      toast.error("Failed to update message");
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    try {
      await contactService.remove(deleteDialog.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.messages });
      toast.success(`Deleted — ${deleteDialog.label}`);
      setDeleteDialog(null);
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  const filtered = searchRecords(messages, search, [
    "subject", "sender_name", "sender_email", "body",
  ]);

  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <SectionHeader title="Inbox" />

      {filtered.length === 0 ? (
        <EmptyState title="No messages found" description="Try adjusting your search." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell>
                    <p className="font-medium">{msg.subject || "No subject"}</p>
                    <p className="max-w-xs truncate text-xs text-muted-foreground">
                      {msg.body || "No content"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{msg.sender_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{msg.sender_email}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={msg.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(msg.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => updateEntity(msg.id, { status: "read" }, "Marked as read")}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark read
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateEntity(msg.id, { status: "archived" }, "Message archived")}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            setDeleteDialog({ id: msg.id, label: msg.subject || "Message" })
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
