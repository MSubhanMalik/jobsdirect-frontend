import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import authService from "@/services/auth";
import employerService from "@/services/employer";
import employeeService from "@/services/employee";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Briefcase, User, CreditCard, FileText, Send, Settings, MessageSquare, Bookmark, File } from "lucide-react";
import RoleSelector from "@/components/dashboard/RoleSelector";

const employerNav = [
  { id: "overview", label: "Overview", path: "/dashboard", icon: Briefcase },
  { id: "profile", label: "Profile", path: "/dashboard/profile", icon: Settings },
  { id: "jobs", label: "My Jobs", path: "/dashboard/jobs", icon: FileText },
  { id: "applications", label: "Applications", path: "/dashboard/applications", icon: Send },
  { id: "billing", label: "Billing", path: "/dashboard/billing", icon: CreditCard },
  { id: "messages", label: "Messages", path: "/dashboard/messages", icon: MessageSquare },
];

const employeeNav = [
  { id: "applications", label: "My Applications", path: "/dashboard", icon: Send },
  { id: "saved", label: "Saved Jobs", path: "/dashboard/saved", icon: Bookmark },
  { id: "cvs", label: "My CVs", path: "/dashboard/cvs", icon: File },
  { id: "profile", label: "Profile", path: "/dashboard/profile", icon: User },
  { id: "messages", label: "Messages", path: "/dashboard/messages", icon: MessageSquare },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) authService.redirectToLogin("/dashboard");
    if (!authLoading && user?.role === "admin") navigate("/admin");
  }, [authLoading, isAuthenticated, user, navigate]);

  const { data: employerData, isLoading: employerLoading } = useQuery({
    queryKey: ["my-employer", user?.email],
    queryFn: () => employerService.list({ user_email: user.email }),
    enabled: !!user && user.role !== "admin",
  });

  const { data: employeeData, isLoading: employeeLoading } = useQuery({
    queryKey: ["my-employee", user?.email],
    queryFn: () => employeeService.list({ user_email: user.email }),
    enabled: !!user && user.role !== "admin",
  });

  const [employer, setEmployer] = useState(null);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const items = employerData?.items || [];
    if (items.length > 0) setEmployer(items[0]);
  }, [employerData]);

  useEffect(() => {
    const items = employeeData?.items || [];
    if (items.length > 0) setEmployee(items[0]);
  }, [employeeData]);

  const loading = authLoading || !user || employerLoading || employeeLoading;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!employer && !employee) {
    return <RoleSelector user={user} onCreated={(type, data) => {
      if (type === "employer") setEmployer(data);
      else setEmployee(data);
    }} />;
  }

  const isEmployer = !!employer;
  const navItems = isEmployer ? employerNav : employeeNav;
  const activeProfile = isEmployer ? employer : employee;
  const pathSegment = location.pathname.replace("/dashboard", "").replace(/^\//, "") || "overview";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className={`${isEmployer ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"} py-6`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">{isEmployer ? "Employer Dashboard" : "My Dashboard"}</h1>
              <p className={`${isEmployer ? "text-primary-foreground/70" : "text-accent-foreground/70"} mt-1`}>
                {user.firstName} {user.lastName}{employer?.company_name ? ` — ${employer.company_name}` : ""}
              </p>
            </div>
            <Button variant="ghost" className={`${isEmployer ? "text-primary-foreground/60 hover:text-primary-foreground" : "text-accent-foreground/60 hover:text-accent-foreground"}`} onClick={() => authService.logout("/")}>
              <LogOut className="w-4 h-4 mr-2" />Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="border-b bg-background sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/dashboard");
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ user, employer, employee, setEmployer, setEmployee, isEmployer }} />
      </div>
    </div>
  );
}
