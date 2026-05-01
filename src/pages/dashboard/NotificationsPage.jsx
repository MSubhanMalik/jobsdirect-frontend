import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Trash2, Clock, ExternalLink } from "lucide-react";
import notificationService from "@/services/notification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import PaginationControls from "@/components/ui/pagination-controls";
import { Link } from "react-router-dom";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => notificationService.list(page),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
  });

  const notifications = notificationsData?.items || [];
  const totalPages = notificationsData?.totalPages || 1;
  const unreadCount = notificationsData?.unreadCount || 0;

  if (isLoading) {
    return <div className="p-8 text-center">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" /> Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 px-2 py-0.5 text-xs">
                {unreadCount} New
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">Stay updated with your latest activity.</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <Check className="w-4 h-4 mr-2" /> Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>You don't have any notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notif) => (
            <Card key={notif.id} className={`transition-colors ${!notif.isRead ? "border-primary/30 bg-primary/5" : ""}`}>
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    !notif.isRead ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1">{notif.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" /> {new Date(notif.createdAt).toLocaleString()}
                      </span>
                      {notif.link && (
                        <Link to={notif.link} className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium">
                          <ExternalLink className="w-3 h-3" /> View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-start">
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:bg-primary/10"
                      onClick={() => markReadMutation.mutate(notif.id)}
                      disabled={markReadMutation.isPending}
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate(notif.id)}
                    disabled={deleteMutation.isPending}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
