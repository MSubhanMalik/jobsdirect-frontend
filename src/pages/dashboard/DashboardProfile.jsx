import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import EmployerProfile from "@/components/dashboard/EmployerProfile";
import EmployeeProfile from "@/components/dashboard/EmployeeProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import authService from "@/services/auth";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function DashboardProfile() {
  const { employer, employee, setEmployer, setEmployee, isEmployer } = useOutletContext();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await authService.deleteAccount();
      toast.success("Account deleted.");
    } catch (err) {
      toast.error(`Could not delete account — ${err.message}`);
      setDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <div className="space-y-8">
      {isEmployer ? (
        <EmployerProfile employer={employer} setEmployer={setEmployer} />
      ) : (
        <EmployeeProfile employee={employee} setEmployee={setEmployee} />
      )}

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDelete}
        title="Delete Your Account"
        description="This will permanently delete your account, profile, applications, saved jobs, and all associated data. This cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete Everything"}
        variant="destructive"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDelete(false)}
        disabled={deleting}
      />
    </div>
  );
}
