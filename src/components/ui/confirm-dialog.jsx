import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Reusable confirmation dialog.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={showConfirm}
 *     title="Confirm Payment"
 *     description="This will deduct 2 credits from your balance."
 *     confirmLabel="Proceed"
 *     onConfirm={() => doAction()}
 *     onCancel={() => setShowConfirm(false)}
 *   />
 */
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  disabled = false,
  onConfirm,
  onCancel,
}) {
  const actionClass = variant === "destructive"
    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    : "";

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onCancel?.(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction className={actionClass} onClick={onConfirm} disabled={disabled}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
