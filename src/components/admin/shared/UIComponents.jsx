import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Inbox, ChevronDown } from "lucide-react";
import { statusMeta } from "./constants";
import { humanize } from "./helpers";

export function StatusBadge({ value }) {
  const meta = statusMeta[value] || { label: humanize(value || "Unknown"), className: "border-border bg-muted text-muted-foreground" };
  return (
    <Badge variant="outline" className={`whitespace-nowrap text-[0.65rem] font-medium ${meta.className}`}>
      {meta.label}
    </Badge>
  );
}

export function StatCard({ icon: Icon, label, value, subtext }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
        <Icon className="w-4 h-4 text-muted-foreground/40" />
      </div>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  );
}

export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, children, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-muted-foreground/30" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-1 max-w-md">{description}</p>}
    </div>
  );
}

export function FieldControlMatrix({ title, description, groups, value, onToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/20 transition-colors"
      >
        <div>
          <h3 className="text-base font-display font-semibold text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-6 py-5 space-y-6 border-t border-border/40">
        {groups.map((group) => {
          const configurableFields = group.fields.filter((field) => !field.adminOnly && field.manageInEmployerForm !== false);
          if (!configurableFields.length) return null;

          return (
            <section key={group.id} className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground">{group.title}</h4>
                {group.description && <p className="text-xs text-muted-foreground">{group.description}</p>}
              </div>
              <div className="space-y-2">
                {configurableFields.map((field) => {
                  const control = value?.[field.key] || { visible: false, required: false };
                  return (
                    <div
                      key={field.key}
                      className="grid gap-3 rounded-lg border border-border/40 bg-muted/20 p-3 md:grid-cols-[minmax(0,1fr)_100px_100px]"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{field.label}</p>
                        <p className="text-[0.65rem] text-muted-foreground capitalize">{field.type.replace(/_/g, " ")}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2 md:justify-self-end">
                        <Label className="text-xs">Visible</Label>
                        <Switch checked={Boolean(control.visible)} onCheckedChange={(checked) => onToggle(field.key, { visible: checked })} />
                      </div>
                      <div className="flex items-center justify-between gap-2 md:justify-self-end">
                        <Label className="text-xs">Required</Label>
                        <Switch
                          checked={Boolean(control.required)}
                          disabled={field.supportsRequired === false || !control.visible}
                          onCheckedChange={(checked) => onToggle(field.key, { required: checked })}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>}
    </div>
  );
}
