import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, MessageSquare, Briefcase, Info } from "lucide-react";
import notificationService from "@/services/notification";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TYPE_ICONS = {
  message: MessageSquare,
  application: Briefcase,
};

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function NotificationBell({ className }) {
  const queryClient = useQueryClient();

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.list(1),
    refetchInterval: 30000,
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notificationsData?.unreadCount || 0;
  const recentNotifications = notificationsData?.items?.slice(0, 5) || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative text-inherit", className)}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); markAllMutation.mutate(); }}
                className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                disabled={markAllMutation.isPending}
              >
                <CheckCheck className="w-3 h-3" /> Read all
              </button>
            )}
            <Link to="/dashboard/notifications" className="text-[11px] text-muted-foreground hover:text-foreground font-medium">
              View All
            </Link>
          </div>
        </div>
        <div className="max-h-[340px] overflow-y-auto divide-y">
          {recentNotifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            recentNotifications.map((notif) => {
              const Icon = TYPE_ICONS[notif.type] || Info;
              return (
                <Link
                  key={notif.id}
                  to={notif.link || "/dashboard/notifications"}
                  className={`flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                    !notif.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    !notif.isRead ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-tight ${!notif.isRead ? "font-semibold" : "font-medium text-muted-foreground"}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{notif.message}</p>
                    <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </Link>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
