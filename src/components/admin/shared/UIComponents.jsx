import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Inbox } from "lucide-react";
import { statusMeta } from "./constants";
import { humanize } from "./helpers";

export function StatusBadge({ value }) {
  const meta = statusMeta[value] || { label: humanize(value || "Unknown"), className: "border-slate-200 bg-slate-50 text-slate-700" };
  return (
    <Badge variant="outline" className={`whitespace-nowrap ${meta.className}`}>
      {meta.label}
    </Badge>
  );
}

export function StatCard({ icon: Icon, label, value, subtext, tone = "primary" }) {
  const toneClass = {
    primary: "bg-primary text-primary-foreground",
    accent: "bg-accent text-accent-foreground",
    amber: "bg-amber-500 text-white",
    blue: "bg-blue-600 text-white",
  }[tone];

  return (
    <Card className="rounded-lg shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
            {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, children, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed bg-background p-8 text-center">
      <Icon className="h-9 w-9 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function FieldControlMatrix({ title, description, groups, value, onToggle }) {
  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {groups.map((group) => {
          const configurableFields = group.fields.filter((field) => !field.adminOnly && field.manageInEmployerForm !== false);
          if (!configurableFields.length) return null;

          return (
            <section key={group.id} className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold">{group.title}</h3>
                {group.description ? <p className="text-xs text-muted-foreground">{group.description}</p> : null}
              </div>
              <div className="space-y-2">
                {configurableFields.map((field) => {
                  const control = value?.[field.key] || { visible: false, required: false };
                  return (
                    <div
                      key={field.key}
                      className="grid gap-3 rounded-lg border p-3 md:grid-cols-[minmax(0,1fr)_110px_110px]"
                    >
                      <div>
                        <p className="text-sm font-medium">{field.label}</p>
                        <p className="text-xs text-muted-foreground">{field.type.replace(/_/g, " ")}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2 md:justify-self-end">
                        <Label>Visible</Label>
                        <Switch checked={Boolean(control.visible)} onCheckedChange={(checked) => onToggle(field.key, { visible: checked })} />
                      </div>
                      <div className="flex items-center justify-between gap-2 md:justify-self-end">
                        <Label>Required</Label>
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
      </CardContent>
    </Card>
  );
}
