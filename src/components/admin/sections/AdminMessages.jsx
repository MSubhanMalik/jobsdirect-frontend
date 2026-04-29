import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, FileText, MoreHorizontal, Trash2 } from "lucide-react";
import { StatusBadge, SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatDate } from "../shared/helpers";
import { queryKeys } from "../shared/constants";

export default function AdminMessages({ messages, search, updateEntity, setDeleteDialog }) {
  const filtered = searchRecords(messages, search, [
    "subject", "sender_name", "sender_email", "body",
  ]);

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
              {filtered.map((msg) => (
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
                          onClick={() =>
                            updateEntity(
                              "Message",
                              msg.id,
                              { status: "read" },
                              [queryKeys.messages],
                              "Marked as read",
                            )
                          }
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark read
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateEntity(
                              "Message",
                              msg.id,
                              { status: "archived" },
                              [queryKeys.messages],
                              "Message archived",
                            )
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            setDeleteDialog({ entity: "ContactMessage", id: msg.id, label: msg.subject || "Message", keys: [queryKeys.messages] })
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
