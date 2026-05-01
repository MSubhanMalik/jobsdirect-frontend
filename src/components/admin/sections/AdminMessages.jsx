import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, FileText, MoreHorizontal, Trash2, Mail, Phone, Clock, ChevronRight, X } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { SectionHeader, EmptyState } from "../shared/UIComponents";
import { searchRecords, formatDate } from "../shared/helpers";
import { queryKeys } from "../shared/constants";
import PaginationControls from "@/components/ui/pagination-controls";
import contactService from "@/services/contact";

const statusConfig = {
  new: { dot: "bg-accent", label: "New" },
  read: { dot: "bg-emerald-500", label: "Read" },
  archived: { dot: "bg-muted-foreground", label: "Archived" },
};

export default function AdminMessages() {
  const { search } = useOutletContext();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [viewMessage, setViewMessage] = useState(null);
  const [page, setPage] = useState(1);

  const messagesQuery = useQuery({ queryKey: queryKeys.messages, queryFn: () => contactService.list() });
  const messages = messagesQuery.data || [];

  const updateEntity = async (id, updates, title) => {
    try {
      await contactService.update(id, updates);
      queryClient.invalidateQueries({ queryKey: queryKeys.messages });
      toast.success(title);
    } catch { toast.error("Failed to update message"); }
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    try {
      await contactService.remove(deleteDialog.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.messages });
      toast.success(`Deleted — ${deleteDialog.label}`);
      setDeleteDialog(null);
    } catch { toast.error("Failed to delete message"); }
  };

  const handleOpenMessage = (msg) => {
    setViewMessage(msg);
    if (msg.status === "new") {
      updateEntity(msg.id, { status: "read" }, "");
    }
  };

  const filtered = searchRecords(messages, search, ["subject", "name", "email", "message"]);

  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Inbox"
        description={`${messages.length} messages${newCount > 0 ? ` · ${newCount} unread` : ""}`}
      />

      {filtered.length === 0 ? (
        <EmptyState title="No messages found" description="Try adjusting your search." />
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
          {paged.map((msg) => {
            const config = statusConfig[msg.status] || statusConfig.new;
            const isNew = msg.status === "new";
            return (
              <div
                key={msg.id}
                className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors group ${
                  isNew ? "bg-accent/[0.02]" : "hover:bg-muted/20"
                }`}
                onClick={() => handleOpenMessage(msg)}
              >
                {/* Status dot */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm truncate ${isNew ? "font-display font-bold text-foreground" : "font-medium text-foreground"}`}>
                      {msg.subject || "No subject"}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-md">
                    {msg.message || "No content"}
                  </p>
                </div>

                {/* Sender */}
                <div className="hidden sm:block text-right shrink-0 min-w-[120px]">
                  <p className="text-xs font-medium text-foreground truncate">{msg.name || "Unknown"}</p>
                  <p className="text-[0.65rem] text-muted-foreground truncate">{msg.email}</p>
                </div>

                {/* Date */}
                <span className="text-[0.65rem] text-muted-foreground whitespace-nowrap shrink-0 hidden md:block w-20 text-right">
                  {formatDate(msg.createdAt)}
                </span>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateEntity(msg.id, { status: "read" }, "Marked as read"); }}>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Mark read
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateEntity(msg.id, { status: "archived" }, "Archived"); }}>
                      <FileText className="mr-2 h-4 w-4" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteDialog({ id: msg.id, label: msg.subject || "Message" }); }}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ChevronRight className="w-4 h-4 text-border group-hover:text-muted-foreground shrink-0 transition-colors" />
              </div>
            );
          })}
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* ── Message Detail Modal ── */}
      <Dialog open={!!viewMessage} onOpenChange={(open) => { if (!open) setViewMessage(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-border/40 pb-4">
            <DialogTitle className="font-display text-lg pr-8">{viewMessage?.subject || "No subject"}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-5">
            {/* Sender info */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <span className="text-sm font-display font-bold text-muted-foreground">
                  {(viewMessage?.name || "U")[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{viewMessage?.name || "Unknown"}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <a href={`mailto:${viewMessage?.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
                    <Mail className="w-3 h-3" /> {viewMessage?.email}
                  </a>
                  {viewMessage?.phone && (
                    <a href={`tel:${viewMessage.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
                      <Phone className="w-3 h-3" /> {viewMessage.phone}
                    </a>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {viewMessage?.createdAt ? formatDate(viewMessage.createdAt) : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Message body */}
            <div className="rounded-xl bg-muted/30 border border-border/40 p-5">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {viewMessage?.message || "No content."}
              </p>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between border-t border-border/40 pt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg h-8 text-xs font-medium"
                onClick={() => { updateEntity(viewMessage.id, { status: "archived" }, "Archived"); setViewMessage(null); }}
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Archive
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg h-8 text-xs font-medium text-destructive hover:text-destructive"
                onClick={() => { setDeleteDialog({ id: viewMessage.id, label: viewMessage.subject || "Message" }); setViewMessage(null); }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
              </Button>
            </div>
            <a href={`mailto:${viewMessage?.email}?subject=Re: ${viewMessage?.subject || ""}`}>
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg h-8 text-xs font-medium">
                <Mail className="w-3.5 h-3.5 mr-1.5" /> Reply via Email
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteDialog}
        title="Delete this message?"
        description={deleteDialog?.label ? `"${deleteDialog.label}" will be permanently removed.` : "This message will be permanently removed."}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog(null)}
      />
    </div>
  );
}
