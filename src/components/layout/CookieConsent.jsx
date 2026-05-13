import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const COOKIE_KEY = "jd_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-3xl mx-auto rounded-xl border border-border/60 bg-card shadow-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">We use cookies</p>
          <p className="text-xs text-muted-foreground mt-1">
            We use essential cookies to keep the site running and optional cookies to improve your experience.
            See our <a href="/cookies" className="text-accent hover:underline">Cookie Policy</a> and <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={decline}>
            Decline
          </Button>
          <Button size="sm" className="rounded-lg h-8 text-xs bg-foreground hover:bg-foreground/90 text-background" onClick={accept}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
