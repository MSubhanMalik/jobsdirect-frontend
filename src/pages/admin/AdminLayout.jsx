import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import authService from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, ShieldCheck } from "lucide-react";
import { ADMIN_ROLES, navItems } from "@/components/admin/shared/constants";
import { humanize } from "@/components/admin/shared/helpers";
import AdminEditor, { useAdminEditor } from "@/components/admin/AdminEditor";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authUser, setAuthUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [search, setSearch] = useState("");
  const { editor, setEditor, openEditor } = useAdminEditor();

  useEffect(() => {
    const load = async () => {
      const authed = await authService.isAuthenticated();
      if (!authed) { authService.redirectToLogin("/admin"); return; }
      const me = await authService.getUserInfo();
      if (!ADMIN_ROLES.has(me.role)) { navigate("/dashboard"); return; }
      setAuthUser(me);
      setCheckingAuth(false);
    };
    load();
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="grid gap-3 md:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const pathSegment = location.pathname.split("/admin/")[1] || "overview";
  const activeSection = pathSegment.split("/")[0] || "overview";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-foreground">
        <div className="flex items-center justify-between h-12 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-foreground" />
            </div>
            <span className="text-sm font-display font-bold text-primary-foreground tracking-tight">
              Admin<span className="text-primary-foreground/30 font-normal ml-1.5 hidden sm:inline">JobsDirect.ie</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[0.6rem] text-primary-foreground/30 hidden sm:inline mr-1">{authUser?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground/40 hover:text-primary-foreground hover:bg-primary-foreground/5 h-7 text-xs rounded-md"
              onClick={() => authService.logout("/")}
            >
              <LogOut className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[240px_1fr]">
        {/* ── Sidebar ── */}
        <aside className="border-b border-border/50 bg-card lg:min-h-[calc(100vh-3rem)] lg:border-b-0 lg:border-r lg:border-border/50">
          <div className="sticky top-12 p-3 space-y-5">
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const sectionPath = item.id === "overview" ? "" : item.id;
                const isActive = activeSection === item.id || (item.id === "overview" && (activeSection === "" || activeSection === "overview"));

                return (
                  <Link
                    key={item.id}
                    to={`/admin/${sectionPath}`}
                    className={`relative w-full flex items-center gap-2.5 rounded-lg px-3 h-9 text-[0.82rem] font-medium transition-all duration-200 ${
                      isActive
                        ? "text-foreground bg-muted/70"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-accent" : ""}`} />
                    {item.label}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-accent rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">Signed in as</p>
              <p className="text-sm font-medium text-foreground truncate">{authUser?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{authUser?.email}</p>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Outlet context={{ authUser, search, setSearch, openEditor }} />
            </motion.div>
            <AdminEditor editor={editor} setEditor={setEditor} />
          </div>
        </main>
      </div>
    </div>
  );
}
