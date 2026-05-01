import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const footerLinks = {
  Platform: [
    { label: "Home", path: "/" },
    { label: "Browse Jobs", path: "/jobs" },
    { label: "For Employers", path: "/employers" },
    { label: "For Employees", path: "/employees" },
  ],
  Support: [
    { label: "Contact Us", path: "/contact" },
    { label: "FAQ", path: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
    { label: "Cookie Policy", path: "/cookies" },
  ],
};

export default function Footer() {
  const { settings } = useSiteSettings();
  const brandName = settings.brand_name || "JobsDirect";

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter strip */}
        <div className="py-10 border-b border-primary-foreground/[0.08] flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="font-display font-semibold text-base text-primary-foreground">Stay in the loop</h3>
            <p className="text-sm text-primary-foreground/40 mt-0.5">Get the latest opportunities delivered weekly.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              placeholder="you@email.com"
              className="bg-primary-foreground/[0.06] border-primary-foreground/[0.08] text-primary-foreground placeholder:text-primary-foreground/30 w-full sm:w-64 h-11 rounded-xl"
            />
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground whitespace-nowrap rounded-xl h-11 px-5">
              Subscribe
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link to="/" className="inline-block mb-5">
              <span className="text-2xl font-display font-bold text-primary-foreground">
                {brandName}<span className="text-accent">.ie</span>
              </span>
            </Link>
            <p className="text-primary-foreground/40 text-sm leading-relaxed max-w-sm mb-7">
              {settings.footer_blurb || "Ireland's premier job platform connecting talented professionals with leading employers across the country."}
            </p>
            <div className="space-y-3 text-sm text-primary-foreground/35">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0" />
                <span>{settings.contact_email || "info@jobsdirect.ie"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{settings.contact_phone || "+353 1 234 5678"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{settings.office_location || "Dublin, Ireland"}</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="lg:col-span-2 first:lg:col-start-7">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] mb-5 text-primary-foreground/50">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-primary-foreground/35 hover:text-accent transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-7 border-t border-primary-foreground/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-foreground/25">
            &copy; {new Date().getFullYear()} {brandName}.ie. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-primary-foreground/25">
            <Link to="/privacy" className="hover:text-accent transition-colors duration-200">Privacy</Link>
            <Link to="/terms" className="hover:text-accent transition-colors duration-200">Terms</Link>
            <Link to="/cookies" className="hover:text-accent transition-colors duration-200">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
