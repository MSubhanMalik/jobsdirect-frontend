import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import authService from "@/services/auth";
import applicationService from "@/services/application";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase, FileText, Send, Eye, LogOut, Clock, CheckCircle, XCircle,
  ArrowRight, Home, ChevronRight, ArrowUpRight, Sparkles, User
} from "lucide-react";
import { motion } from "framer-motion";
import NotificationBell from "./NotificationBell";
import EmployeeProfile from "./EmployeeProfile";

const statusConfig = {
  submitted: { icon: Clock, color: "text-amber-600", bg: "bg-amber-500", label: "Submitted" },
  reviewed: { icon: Eye, color: "text-blue-600", bg: "bg-blue-500", label: "Reviewed" },
  shortlisted: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-500", label: "Shortlisted" },
  rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-500", label: "Rejected" },
  hired: { icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-600", label: "Hired" },
};

export default function EmployeeDashboard({ user, employee, setEmployee }) {
  const tabStorageKey = `jobsdirect_employee_dashboard_tab_${user.email}`;
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "overview";
    const saved = window.sessionStorage.getItem(tabStorageKey);
    return ["overview", "profile"].includes(saved) ? saved : "overview";
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(tabStorageKey, activeTab);
  }, [tabStorageKey, activeTab]);

  const { data: appsData } = useQuery({
    queryKey: ["my-applications", user.email],
    queryFn: () => applicationService.list({ employee_email: user.email, pageSize: 100 }),
  });
  const applications = appsData?.items || [];

  const shortlisted = applications.filter((a) => a.status === "shortlisted").length;
  const displayName = user.firstName || employee.first_name || "there";
  const initials = `${(user.firstName || employee.first_name || "U")[0]}${(user.lastName || employee.last_name || "")[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Hero header ── */}
      <div className="relative overflow-hidden bg-foreground">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-start sm:items-center justify-between gap-4">
            {/* Left: avatar + greeting */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                <span className="text-lg font-display font-bold text-accent-foreground">{initials}</span>
              </div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl sm:text-2xl font-display font-bold text-primary-foreground tracking-tight"
                >
                  Welcome back, {displayName}
                </motion.h1>
                <p className="text-primary-foreground/35 text-sm mt-0.5">{user.email}</p>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="ghost" size="icon" className="text-primary-foreground/40 hover:text-primary-foreground hover:bg-primary-foreground/5 w-9 h-9 rounded-xl">
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
              <NotificationBell />
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground/40 hover:text-primary-foreground hover:bg-primary-foreground/5 h-9 text-xs rounded-xl"
                onClick={() => authService.logout("/")}
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Stats row — sits inside the dark header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8"
          >
            {[
              { label: "Total Applied", value: applications.length, icon: Send },
              { label: "Shortlisted", value: shortlisted, icon: Sparkles },
              { label: "CVs Uploaded", value: employee.cv_url ? 1 : 0, icon: FileText },
              { label: "Discoverable", value: employee.is_searchable ? "Yes" : "No", icon: Eye },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-primary-foreground/[0.05] border border-primary-foreground/[0.06] px-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-primary-foreground/35">{stat.label}</span>
                </div>
                <p className="text-2xl font-display font-bold text-primary-foreground">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab bar */}
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-card border border-border/50 shadow-sm p-1 rounded-xl h-auto">
              <TabsTrigger
                value="overview"
                className="rounded-lg px-5 py-2 text-sm font-medium data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="rounded-lg px-5 py-2 text-sm font-medium data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none"
              >
                Profile
              </TabsTrigger>
            </TabsList>

            <Link to="/jobs" className="hidden sm:block">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-5 h-9 text-sm font-medium group">
                Browse Jobs
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* ── Overview tab ── */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Browse Jobs", desc: "Find your next role", icon: Briefcase, to: "/jobs", accent: true },
                { label: "My Saved Jobs", desc: "Jobs you've bookmarked", icon: Briefcase, to: "/dashboard/saved", accent: false },
                { label: "Job Alerts", desc: "Get notified of new jobs", icon: Sparkles, to: "/dashboard/alerts", accent: false },
              ].map((action) => (
                <Link key={action.label} to={action.to}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`rounded-xl border p-5 flex items-center gap-4 transition-all duration-200 cursor-pointer group ${
                      action.accent
                        ? "bg-accent text-accent-foreground border-accent hover:shadow-lg"
                        : "bg-card border-border/50 hover:shadow-md hover:border-border"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      action.accent ? "bg-accent-foreground/15" : "bg-muted"
                    }`}>
                      <action.icon className={`w-5 h-5 ${action.accent ? "text-accent-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${action.accent ? "" : "text-foreground"}`}>{action.label}</p>
                      <p className={`text-xs mt-0.5 ${action.accent ? "text-accent-foreground/70" : "text-muted-foreground"}`}>{action.desc}</p>
                    </div>
                    <ArrowUpRight className={`w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                      action.accent ? "text-accent-foreground/60" : "text-muted-foreground"
                    }`} />
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Recent Applications */}
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
                <h2 className="text-base font-display font-semibold text-foreground">Recent Applications</h2>
                <span className="text-xs text-muted-foreground">{applications.length} total</span>
              </div>

              {applications.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-muted-foreground/25" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No applications yet</p>
                  <p className="text-xs text-muted-foreground mb-5">Start exploring and land your next opportunity.</p>
                  <Link to="/jobs">
                    <Button variant="outline" size="sm" className="rounded-full px-5 font-medium">
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {applications.map((app, i) => {
                    const config = statusConfig[app.status] || statusConfig.submitted;
                    const StatusIcon = config.icon;
                    return (
                      <Link
                        key={app.id}
                        to={`/jobs/${app.job_id}`}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
                      >
                        {/* Company initial */}
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <span className="text-sm font-display font-bold text-muted-foreground">
                            {(app.company_name || "C")[0].toUpperCase()}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate">
                            {app.job_title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{app.company_name}</p>
                        </div>

                        {/* Status dot + label */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`w-2 h-2 rounded-full ${config.bg}`} />
                          <span className="text-xs font-medium text-muted-foreground capitalize">{config.label}</span>
                        </div>

                        <ChevronRight className="w-4 h-4 text-border group-hover:text-muted-foreground shrink-0 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Profile tab ── */}
          <TabsContent value="profile">
            <EmployeeProfile employee={employee} setEmployee={setEmployee} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
