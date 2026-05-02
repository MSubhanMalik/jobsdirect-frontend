import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import authService from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ADMIN_ROLES, navItems } from "@/components/admin/shared/constants";
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
      <div className="min-h-screen bg-[#fafaf9] p-6">
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
  const activeItem = navItems.find((n) => n.id === activeSection) || navItems[0];
  const initials = `${(authUser?.first_name || authUser?.full_name || "A")[0]}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <div className="grid lg:grid-cols-[260px_1fr] min-h-screen">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col bg-white border-r border-[#eee]">
          {/* Brand */}
          <div className="h-14 flex items-center px-5 border-b border-[#eee]">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="text-[0.95rem] font-display font-bold text-[#1a1a1a] tracking-tight">
                Jobs<span className="text-accent">Direct</span>
              </span>
              <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-accent bg-accent/8 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </Link>
          </div>

          {/* Search */}
          <div className="px-3 pt-4 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-8 pl-8 text-xs bg-[#fafaf9] border-[#eee] rounded-lg focus-visible:ring-accent/30"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const sectionPath = item.id === "overview" ? "" : item.id;
              const isActive = activeSection === item.id || (item.id === "overview" && (activeSection === "" || activeSection === "overview"));

              return (
                <Link
                  key={item.id}
                  to={`/admin/${sectionPath}`}
                  className={`group flex items-center gap-2.5 rounded-lg px-3 h-9 text-[0.82rem] transition-all duration-150 ${
                    isActive
                      ? "bg-accent/[0.07] text-accent font-semibold"
                      : "text-[#666] hover:text-[#1a1a1a] hover:bg-[#f5f5f4] font-medium"
                  }`}
                >
                  <Icon className={`h-[1.1rem] w-[1.1rem] ${isActive ? "text-accent" : "text-[#aaa] group-hover:text-[#888]"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User card */}
          <div className="p-3 border-t border-[#eee]">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#fafaf9]">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1a1a1a] truncate">{authUser?.full_name || authUser?.email}</p>
                <p className="text-[0.65rem] text-[#999] truncate">{authUser?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-[#bbb] hover:text-[#666] shrink-0"
                onClick={() => authService.logout("/")}
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </aside>

        {/* ── Mobile header ── */}
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#eee]">
          <div className="flex items-center justify-between h-12 px-4">
            <span className="text-sm font-display font-bold text-[#1a1a1a]">
              Jobs<span className="text-accent">Direct</span>
              <span className="text-[0.6rem] font-semibold text-accent ml-1.5">Admin</span>
            </span>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-[#999]" onClick={() => authService.logout("/")}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
          <nav className="flex overflow-x-auto px-4 pb-2 gap-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const sectionPath = item.id === "overview" ? "" : item.id;
              const isActive = activeSection === item.id || (item.id === "overview" && (activeSection === "" || activeSection === "overview"));
              return (
                <Link
                  key={item.id}
                  to={`/admin/${sectionPath}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-colors ${
                    isActive ? "bg-accent/[0.07] text-accent" : "text-[#999] hover:text-[#666]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />{item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Main ── */}
        <main className="min-w-0">
          {/* Page header */}
          <div className="hidden lg:flex items-center h-14 px-8 border-b border-[#eee] bg-white">
            <div className="flex items-center gap-1.5 text-xs text-[#999]">
              <span>Admin</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#1a1a1a] font-medium">{activeItem.label}</span>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Outlet context={{ authUser, search, setSearch, openEditor }} />
              </motion.div>
              <AdminEditor editor={editor} setEditor={setEditor} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
