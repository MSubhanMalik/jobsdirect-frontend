import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import authService from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Search, ShieldCheck } from "lucide-react";
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
          <Skeleton className="h-16 w-full" />
          <div className="grid gap-4 md:grid-cols-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Derive active section from URL path
  const pathSegment = location.pathname.split("/admin/")[1] || "overview";
  const activeSection = pathSegment.split("/")[0] || "overview";

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex min-h-16 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><ShieldCheck className="h-5 w-5" /></div>
            <div><h1 className="text-lg font-semibold leading-tight">Admin CMS</h1><p className="text-xs text-muted-foreground">JobsDirect operations dashboard</p></div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search current workspace" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{humanize(authUser?.role)}</Badge>
              <Button variant="outline" size="sm" onClick={() => authService.logout("/")}><LogOut className="h-4 w-4" />Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[260px_1fr]">
        <aside className="border-b bg-background lg:min-h-[calc(100vh-65px)] lg:border-b-0 lg:border-r">
          <div className="sticky top-16 space-y-6 p-4">
            <nav className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const sectionPath = item.id === "overview" ? "" : item.id;
                const isActive = activeSection === item.id || (item.id === "overview" && activeSection === "");
                return (
                  <Link
                    key={item.id}
                    to={`/admin/${sectionPath}`}
                    className={`flex h-10 items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <Separator />
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">Signed in as</p>
              <p className="mt-2 truncate text-sm font-medium">{authUser?.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">{authUser?.email}</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet context={{ authUser, search, setSearch, openEditor }} />
            <AdminEditor editor={editor} setEditor={setEditor} />
          </div>
        </main>
      </div>
    </div>
  );
}
