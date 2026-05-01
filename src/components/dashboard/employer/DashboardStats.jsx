import React from "react";
import { Briefcase, Clock, Send, CreditCard, Lock } from "lucide-react";

const stats = [
  { key: "activeJobs", label: "Active Jobs", icon: Briefcase },
  { key: "pendingJobs", label: "Pending Review", icon: Clock },
  { key: "applications", label: "Applications", icon: Send },
  { key: "credits", label: "Credits", icon: CreditCard },
];

export default function DashboardStats({ activeJobs, pendingJobs, applications, credits, isApproved }) {
  const values = { activeJobs, pendingJobs, applications, credits };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {stats.map((stat) => (
        <div key={stat.key} className="rounded-xl bg-card border border-border/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {stat.label}
            </span>
            <stat.icon className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-display font-bold text-foreground">{values[stat.key]}</p>
            {!isApproved && stat.key === "activeJobs" && (
              <Lock className="w-3 h-3 text-muted-foreground/40" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
