import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ArrowRight } from "lucide-react";
import authService from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Jobs", path: "/jobs" },
  { label: "Employers", path: "/employers" },
  { label: "Employees", path: "/employees" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { settings } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const brandName = settings.brand_name || "JobsDirect";

  const isActive = (path) => location.pathname === path;
  const dashboardPath = user?.role === "admin" ? "/admin" : "/dashboard";
  const isHome = location.pathname === "/";

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 ${
      isHome
        ? "bg-[#1a2332]/80 backdrop-blur-xl border-white/[0.06]"
        : "bg-background/80 backdrop-blur-xl border-border/40"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.25rem]">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className={`text-[1.3rem] font-display font-bold tracking-tight ${isHome ? "text-white" : "text-foreground"}`}>
              Jobs<span className="font-extrabold">Direct</span><span className="text-[#4eca8b]">.ie</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-lg text-[0.9rem] font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? isHome ? "text-white bg-white/10" : "text-foreground bg-muted"
                    : isHome ? "text-white/60 hover:text-white hover:bg-white/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={dashboardPath}>
                <Button className="bg-[#4eca8b] hover:bg-[#45b87e] text-white font-medium rounded-full px-6 h-10">
                  Dashboard
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className={`font-medium h-10 ${isHome ? "text-white/70 hover:text-white hover:bg-white/5" : "text-muted-foreground"}`}
                  onClick={() => authService.redirectToLogin()}
                >
                  Login
                </Button>
                <Button
                  className="bg-[#4eca8b] hover:bg-[#45b87e] text-white font-medium rounded-full px-6 h-10"
                  onClick={() => window.location.assign("/auth?mode=register")}
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className={isHome ? "text-white" : "text-foreground"}>
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 bg-[#1a2332] border-white/10">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-white/10">
                  <span className="text-xl font-display font-bold tracking-tight text-white">
                    Jobs<span className="font-extrabold">Direct</span><span className="text-[#4eca8b]">.ie</span>
                  </span>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive(link.path)
                          ? "bg-white/10 text-white"
                          : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                      {isActive(link.path) && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4eca8b]" />
                      )}
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t border-white/10 space-y-2">
                  {isAuthenticated ? (
                    <Link to={dashboardPath} onClick={() => setOpen(false)}>
                      <Button className="w-full bg-[#4eca8b] hover:bg-[#45b87e] text-white rounded-full h-11">
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Button
                        className="w-full bg-[#4eca8b] hover:bg-[#45b87e] text-white rounded-full h-11"
                        onClick={() => { setOpen(false); authService.redirectToLogin(); }}
                      >
                        Register
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full text-white/50 hover:text-white h-11"
                        onClick={() => { setOpen(false); authService.redirectToLogin(); }}
                      >
                        Login
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
