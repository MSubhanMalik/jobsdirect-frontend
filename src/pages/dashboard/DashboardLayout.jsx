import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/authStore";
import authService from "@/services/auth";
import employerService from "@/services/employer";
import employeeService from "@/services/employee";
import paymentService from "@/services/payment";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Home, Briefcase, User, CreditCard, FileText, Send, Settings, MessageSquare, Bookmark, File, Bell, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RoleSelector from "@/components/dashboard/RoleSelector";
import NotificationBell from "@/components/dashboard/NotificationBell";

const employerNav = [
  { id: "overview", label: "Overview", path: "/dashboard", icon: Briefcase },
  { id: "profile", label: "Profile", path: "/dashboard/profile", icon: Settings },
  { id: "jobs", label: "My Jobs", path: "/dashboard/jobs", icon: FileText },
  { id: "cv-search", label: "CV Database", path: "/dashboard/cv-search", icon: Search },
  { id: "applications", label: "Applications", path: "/dashboard/applications", icon: Send },
  { id: "billing", label: "Billing", path: "/dashboard/billing", icon: CreditCard },
  { id: "messages", label: "Messages", path: "/dashboard/messages", icon: MessageSquare },
];

const employeeNav = [
  { id: "applications", label: "My Applications", path: "/dashboard", icon: Send },
  { id: "saved", label: "Saved Jobs", path: "/dashboard/saved", icon: Bookmark },
  { id: "alerts", label: "Job Alerts", path: "/dashboard/alerts", icon: Bell },
  { id: "cvs", label: "My CVs", path: "/dashboard/cvs", icon: File },
  { id: "profile", label: "Profile", path: "/dashboard/profile", icon: User },
  { id: "messages", label: "Messages", path: "/dashboard/messages", icon: MessageSquare },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) authService.redirectToLogin("/dashboard");
    if (!authLoading && user?.role === "admin") navigate("/admin");
  }, [authLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");
    if (payment === "success" && sessionId) {
      paymentService.syncCheckoutSession(sessionId).then((result) => {
        if (result.success) {
          const kind = result.payment?.kind;
          let msg = "Payment complete — Thank you for your purchase.";
          if (kind === "job_posting") msg = "Payment complete — Your job listing is now pending review.";
          else if (kind === "credit_bundle") msg = "Payment complete — Credits added to your balance.";
          else if (kind === "subscription" || kind === "candidate_database") msg = "Subscription active — You now have access to the CV Database.";
          else if (kind === "cv_plan") msg = "Plan upgraded — Your CV features have been updated.";
          
          toast.success(msg);
          queryClient.invalidateQueries({ queryKey: ["my-employer", user?.email] });
          queryClient.invalidateQueries({ queryKey: ["employer-jobs", user?.email] });
        }
      }).catch(() => toast.error("Could not verify payment. Please refresh."));
      navigate(location.pathname, { replace: true });
    } else if (payment === "cancelled") {
      toast.info("Payment cancelled — no charge was made.");
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate, location.pathname, user?.email, queryClient]);

  const { data: employerData, isLoading: employerLoading } = useQuery({
    queryKey: ["my-employer", user?.email],
    queryFn: () => employerService.list({ user_email: user.email }),
    enabled: !!user && user.role !== "admin",
    staleTime: 5 * 60 * 1000,
  });

  const { data: employeeData, isLoading: employeeLoading } = useQuery({
    queryKey: ["my-employee", user?.email],
    queryFn: () => employeeService.list({ user_email: user.email }),
    enabled: !!user && user.role !== "admin",
    staleTime: 5 * 60 * 1000,
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

  const syncedRef = useRef(false);
  useEffect(() => {
    if (!employer?.id || syncedRef.current) return;
    syncedRef.current = true;
    paymentService.getBalance(employer.id).then((balance) => {
      if (!balance) return;
      const updates = {};
      if (balance.credits !== undefined && balance.credits !== employer.credits) updates.credits = balance.credits;
      if (balance.candidate_database_access !== undefined && balance.candidate_database_access !== employer.candidate_database_access) updates.candidate_database_access = balance.candidate_database_access;
      if (balance.candidate_database_status && balance.candidate_database_status !== employer.candidate_database_status) updates.candidate_database_status = balance.candidate_database_status;
      if (balance.credits_expiring_soon !== undefined) updates.credits_expiring_soon = balance.credits_expiring_soon;
      if (Object.keys(updates).length) setEmployer((prev) => ({ ...prev, ...updates }));
    }).catch(() => {});
  }, [employer?.id]);

  const isEmployer = !!employer;
  const isApproved = isEmployer ? employer.verification_status === "approved" : true;
  
  const navItems = useMemo(() => {
    let items = isEmployer ? employerNav : employeeNav;
    if (isEmployer) {
      if (!isApproved) {
        // Only show Overview and Profile for unapproved employers
        items = items.filter(item => item.id === "overview" || item.id === "profile");
      } else {
        // For approved employers, check for CV Database access
        const hasCVAccess = employer.candidate_database_access;
        if (!hasCVAccess) {
          items = items.filter(item => item.id !== "cv-search");
        }
      }
    }
    return items;
  }, [isEmployer, isApproved, employer?.candidate_database_access]);

  // Enforce access control for unapproved or non-subscribed employers
  useEffect(() => {
    if (isEmployer) {
      const currentItem = employerNav.find(item => {
        const exactMatch = item.path === "/dashboard" && location.pathname === "/dashboard";
        const subMatch = item.path !== "/dashboard" && location.pathname.startsWith(item.path);
        return exactMatch || subMatch;
      });

      const currentId = currentItem?.id;

      if (!isApproved && currentId && currentId !== "overview" && currentId !== "profile") {
        navigate("/dashboard", { replace: true });
        toast.warning("Profile Verification Required — Please upload your documents and wait for approval to access all features.");
      } else if (isApproved && currentId === "cv-search" && !employer.candidate_database_access) {
        navigate("/dashboard", { replace: true });
        toast.info("Subscription Required — You need an active CV Database plan to access this feature.");
      }
    }
  }, [isEmployer, isApproved, employer?.candidate_database_access, location.pathname, navigate]);

  const outletContext = useMemo(
    () => ({ user, employer, employee, setEmployer, setEmployee, isEmployer }),
    [user, employer, employee, isEmployer],
  );

  const loading = authLoading || !user || employerLoading || employeeLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="flex gap-3 mb-8">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-9 w-28 rounded-lg" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!employer && !employee) {
    return <RoleSelector user={user} onCreated={(type, data) => {
      if (type === "employer") setEmployer(data);
      else setEmployee(data);
    }} />;
  }

  const initials = `${(user.first_name || "U")[0]}${(user.last_name || "")[0] || ""}`.toUpperCase();
  const displayName = `${user.first_name || ""} ${user.last_name || ""}`.trim();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Hero header with background image ── */}
      <div className="relative overflow-hidden bg-foreground">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/id/1076/2400/600"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/80 to-foreground/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row */}
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-xs font-display font-bold text-accent-foreground">{initials}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-primary-foreground/90 leading-none">{displayName}</p>
                <p className="text-[0.6rem] text-primary-foreground/40 mt-0.5">
                  {isEmployer ? employer.company_name || "Employer" : "Job Seeker"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link to="/">
                <Button variant="ghost" size="icon" className="w-8 h-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5 rounded-lg">
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
              <NotificationBell className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5 w-8 h-8 rounded-lg" />
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground/40 hover:text-primary-foreground hover:bg-primary-foreground/5 h-8 text-xs rounded-lg ml-1"
                onClick={() => authService.logout("/")}
              >
                <LogOut className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Greeting */}
          <div className="pb-6 pt-2">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-primary-foreground tracking-tight">
              {isEmployer ? "Employer Dashboard" : "My Dashboard"}
            </h1>
            <p className="text-sm text-primary-foreground/35 mt-0.5">
              {isEmployer
                ? `Manage your listings, applications, and billing`
                : `Track your applications and manage your profile`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="bg-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-0.5 overflow-x-auto py-1.5 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const exactMatch = item.path === "/dashboard" && location.pathname === "/dashboard";
              const subMatch = item.path !== "/dashboard" && location.pathname.startsWith(item.path);
              const active = exactMatch || subMatch;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-[0.82rem] font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-accent" : ""}`} />
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-accent rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Outlet context={outletContext} />
        </motion.div>
      </div>
    </div>
  );
}
