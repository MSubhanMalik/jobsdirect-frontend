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

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.25rem]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 group">
            <span className="text-[1.35rem] font-display font-bold tracking-tight text-foreground">
              {brandName}<span className="text-accent">.ie</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 text-[0.9rem] font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-accent rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={dashboardPath}>
                <Button className="bg-foreground hover:bg-foreground/90 text-background font-medium rounded-full px-6 h-10">
                  Dashboard
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-muted-foreground font-medium h-10"
                  onClick={() => authService.redirectToLogin()}
                >
                  Sign in
                </Button>
                <Button
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-full px-6 h-10"
                  onClick={() => authService.redirectToLogin()}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border">
                  <span className="text-xl font-display font-bold tracking-tight">
                    {brandName}<span className="text-accent">.ie</span>
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
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      {link.label}
                      {isActive(link.path) && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                      )}
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t border-border space-y-2">
                  {isAuthenticated ? (
                    <Link to={dashboardPath} onClick={() => setOpen(false)}>
                      <Button className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-full h-11">
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Button
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-11"
                        onClick={() => { setOpen(false); authService.redirectToLogin(); }}
                      >
                        Get Started
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground h-11"
                        onClick={() => { setOpen(false); authService.redirectToLogin(); }}
                      >
                        Sign in
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
