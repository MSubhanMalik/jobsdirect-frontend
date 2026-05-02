import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import teamService from "@/services/team";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { Users, UserPlus, Trash2, Shield, Crown, Mail } from "lucide-react";

const ROLE_BADGES = {
  owner: { label: "Owner", color: "bg-amber-100 text-amber-800", icon: Crown },
  admin: { label: "Admin", color: "bg-blue-100 text-blue-800", icon: Shield },
  recruiter: { label: "Recruiter", color: "bg-muted text-muted-foreground", icon: Users },
};

const STATUS_BADGES = {
  active: { label: "Active", color: "bg-green-100 text-green-800" },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800" },
  removed: { label: "Removed", color: "bg-red-100 text-red-800" },
};

export default function DashboardTeam() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "recruiter" });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => teamService.list(),
  });

  const inviteMutation = useMutation({
    mutationFn: () => teamService.invite(inviteForm.email, inviteForm.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success(`Invitation sent to ${inviteForm.email}`);
      setShowInvite(false);
      setInviteForm({ email: "", role: "recruiter" });
    },
    onError: (err) => toast.error(err.message || "Failed to send invitation"),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => teamService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Team member removed");
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => teamService.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Role updated");
    },
  });

  const activeMembers = members.filter((m) => m.status !== "removed");
  const currentMember = members.find((m) => m.user_id === user.id);
  const isOwnerOrAdmin = currentMember?.role === "owner" || currentMember?.role === "admin";

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading team...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Team Members</h2>
        {isOwnerOrAdmin && (
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Invite Member
          </Button>
        )}
      </div>

      {activeMembers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No team members yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeMembers.map((member) => {
            const roleBadge = ROLE_BADGES[member.role] || ROLE_BADGES.recruiter;
            const statusBadge = STATUS_BADGES[member.status] || STATUS_BADGES.pending;
            const RoleIcon = roleBadge.icon;

            return (
              <Card key={member.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <RoleIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {member.user ? `${member.user.first_name} ${member.user.last_name}` : member.email}
                        </p>
                        <Badge className={`text-[10px] ${roleBadge.color} border-none`}>{roleBadge.label}</Badge>
                        {member.status === "pending" && (
                          <Badge className={`text-[10px] ${statusBadge.color} border-none`}>
                            <Mail className="w-3 h-3 mr-0.5" /> Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  {isOwnerOrAdmin && member.role !== "owner" && (
                    <div className="flex items-center gap-2">
                      {currentMember?.role === "owner" && member.status === "active" && (
                        <Select
                          value={member.role}
                          onValueChange={(role) => roleMutation.mutate({ id: member.id, role })}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="recruiter">Recruiter</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeMutation.mutate(member.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="colleague@company.com"
              />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={inviteForm.role} onValueChange={(v) => setInviteForm({ ...inviteForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — Full access to jobs, applications, billing</SelectItem>
                  <SelectItem value="recruiter">Recruiter — Can view/manage jobs and applications</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button onClick={() => inviteMutation.mutate()} disabled={!inviteForm.email || inviteMutation.isPending}>
              {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
