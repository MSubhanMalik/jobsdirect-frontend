import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, Settings } from "lucide-react";
import { SectionHeader, Field, FieldControlMatrix } from "../shared/UIComponents";
import { COMPANY_FIELD_GROUPS, JOB_FIELD_GROUPS } from "@/lib/siteSettings";

export default function AdminSettings({
  settingsForm,
  setSettingsForm,
  saving,
  onSave,
  updateSettingsFieldControl,
}) {
  return (
    <form onSubmit={onSave} className="space-y-6">
      <SectionHeader
        title="Site CMS"
        description="Customize brand text, publishing rules, and the employer-facing company and job forms."
        action={
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
            Save Settings
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Brand and homepage</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Brand name">
              <Input value={settingsForm.brand_name} onChange={(e) => setSettingsForm({ ...settingsForm, brand_name: e.target.value })} />
            </Field>
            <Field label="Hero eyebrow">
              <Input value={settingsForm.hero_eyebrow} onChange={(e) => setSettingsForm({ ...settingsForm, hero_eyebrow: e.target.value })} />
            </Field>
            <Field label="Hero title">
              <Input value={settingsForm.hero_title} onChange={(e) => setSettingsForm({ ...settingsForm, hero_title: e.target.value })} />
            </Field>
            <Field label="Hero highlight">
              <Input value={settingsForm.hero_highlight} onChange={(e) => setSettingsForm({ ...settingsForm, hero_highlight: e.target.value })} />
            </Field>
            <Field label="Hero subtitle">
              <Textarea className="min-h-24" value={settingsForm.hero_subtitle} onChange={(e) => setSettingsForm({ ...settingsForm, hero_subtitle: e.target.value })} />
            </Field>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Contact and rules</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Contact email">
              <Input type="email" value={settingsForm.contact_email} onChange={(e) => setSettingsForm({ ...settingsForm, contact_email: e.target.value })} />
            </Field>
            <Field label="Contact phone">
              <Input value={settingsForm.contact_phone} onChange={(e) => setSettingsForm({ ...settingsForm, contact_phone: e.target.value })} />
            </Field>
            <Field label="Office location">
              <Input value={settingsForm.office_location} onChange={(e) => setSettingsForm({ ...settingsForm, office_location: e.target.value })} />
            </Field>
            <Field label="Footer blurb">
              <Textarea className="min-h-24" value={settingsForm.footer_blurb} onChange={(e) => setSettingsForm({ ...settingsForm, footer_blurb: e.target.value })} />
            </Field>
            <Separator />
            <div className="space-y-3">
              {[
                ["featured_jobs_enabled", "Featured jobs enabled"],
                ["employer_approval_required", "Employer approval required"],
                ["job_approval_required", "Job approval required"],
              ].map(([field, label]) => (
                <div key={field} className="flex items-center justify-between gap-4">
                  <Label>{label}</Label>
                  <Switch checked={Boolean(settingsForm[field])} onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, [field]: checked })} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Job Listing Cost Products</CardTitle>
          <p className="text-sm text-muted-foreground">Stripe Product IDs for each cost item. The default price of each product is used to calculate credit deductions. Update prices in Stripe Dashboard.</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {[
            ["JOB_LISTING", "Job Listing (30 Days)"],
            ["DUPLICATE_JOB", "Duplicate Job"],
            ["IMPORT_JOB", "Import Job"],
            ["ADDON_FEATURED", "Featured Add-on"],
            ["ADDON_HIGHLIGHT", "Highlight Add-on"],
          ].map(([key, label]) => (
            <Field key={key} label={`${label} — Stripe Product ID`}>
              <Input
                placeholder="prod_xxxxxxxxxx"
                value={settingsForm.pricing_products?.[key] || ""}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    pricing_products: { ...(settingsForm.pricing_products || {}), [key]: e.target.value },
                  })
                }
              />
            </Field>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Credit Costs</CardTitle>
          <p className="text-sm text-muted-foreground">How many credits each action costs. These are deducted from the employer's credit balance.</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {[
            ["JOB_LISTING", "Job Listing"],
            ["DUPLICATE_JOB", "Duplicate Job"],
            ["IMPORT_JOB", "Import from JobsIreland"],
            ["ADDON_FEATURED", "Featured Add-on"],
            ["ADDON_HIGHLIGHT", "Highlight Add-on"],
          ].map(([key, label]) => (
            <Field key={key} label={`${label} (credits)`}>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={settingsForm.credit_costs?.[key] ?? ""}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    credit_costs: { ...(settingsForm.credit_costs || {}), [key]: Number(e.target.value) || 0 },
                  })
                }
              />
            </Field>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Payment Plans (Stripe)</CardTitle>
              <p className="text-sm text-muted-foreground">Configure plans with Stripe Product IDs. The default price of each product is used at checkout.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setSettingsForm({
                  ...settingsForm,
                  payment_plans: [
                    ...(settingsForm.payment_plans || []),
                    { id: `plan_${Date.now()}`, label: "", description: "", stripe_product_id: "", kind: "credits", credits: 0, mode: "payment", enabled: true },
                  ],
                })
              }
            >
              <Plus className="h-4 w-4" /> Add Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(settingsForm.payment_plans || []).map((plan, index) => (
            <div key={plan.id || index} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={plan.enabled !== false ? "default" : "secondary"}>{plan.enabled !== false ? "Active" : "Disabled"}</Badge>
                  <Badge variant="outline">{plan.kind === "candidate_database" ? "Subscription" : "One-time"}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={plan.enabled !== false}
                    onCheckedChange={(checked) => {
                      const plans = [...(settingsForm.payment_plans || [])];
                      plans[index] = { ...plans[index], enabled: checked };
                      setSettingsForm({ ...settingsForm, payment_plans: plans });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const plans = (settingsForm.payment_plans || []).filter((_, i) => i !== index);
                      setSettingsForm({ ...settingsForm, payment_plans: plans });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Plan ID">
                  <Input
                    value={plan.id}
                    onChange={(e) => {
                      const plans = [...(settingsForm.payment_plans || [])];
                      plans[index] = { ...plans[index], id: e.target.value };
                      setSettingsForm({ ...settingsForm, payment_plans: plans });
                    }}
                  />
                </Field>
                <Field label="Label">
                  <Input
                    value={plan.label}
                    onChange={(e) => {
                      const plans = [...(settingsForm.payment_plans || [])];
                      plans[index] = { ...plans[index], label: e.target.value };
                      setSettingsForm({ ...settingsForm, payment_plans: plans });
                    }}
                  />
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <Input
                    value={plan.description}
                    onChange={(e) => {
                      const plans = [...(settingsForm.payment_plans || [])];
                      plans[index] = { ...plans[index], description: e.target.value };
                      setSettingsForm({ ...settingsForm, payment_plans: plans });
                    }}
                  />
                </Field>
                <Field label="Stripe Product ID">
                  <Input
                    placeholder="prod_xxxxxxxxxx"
                    value={plan.stripe_product_id}
                    onChange={(e) => {
                      const plans = [...(settingsForm.payment_plans || [])];
                      plans[index] = { ...plans[index], stripe_product_id: e.target.value };
                      setSettingsForm({ ...settingsForm, payment_plans: plans });
                    }}
                  />
                </Field>
                <Field label="Kind">
                  <Select
                    value={plan.kind}
                    onValueChange={(value) => {
                      const plans = [...(settingsForm.payment_plans || [])];
                      plans[index] = { ...plans[index], kind: value, mode: value === "candidate_database" ? "subscription" : "payment" };
                      setSettingsForm({ ...settingsForm, payment_plans: plans });
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credits">Credits</SelectItem>
                      <SelectItem value="candidate_database">Candidate Database</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                {plan.kind === "credits" && (
                  <Field label="Credits">
                    <Input
                      type="number"
                      value={plan.credits}
                      onChange={(e) => {
                        const plans = [...(settingsForm.payment_plans || [])];
                        plans[index] = { ...plans[index], credits: Number(e.target.value) || 0 };
                        setSettingsForm({ ...settingsForm, payment_plans: plans });
                      }}
                    />
                  </Field>
                )}
              </div>
            </div>
          ))}
          {!(settingsForm.payment_plans || []).length && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No payment plans configured. Add a plan to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <FieldControlMatrix
          title="Employer Company Form"
          description="Show, hide, and require fields for the employer company profile form."
          groups={COMPANY_FIELD_GROUPS}
          value={settingsForm.employer_company_form_config}
          onToggle={(fieldKey, updates) => updateSettingsFieldControl("employer_company_form_config", fieldKey, updates)}
        />
        <FieldControlMatrix
          title="Employer Job Post Form"
          description="Control which vacancy fields employers can see when they create or edit jobs."
          groups={JOB_FIELD_GROUPS}
          value={settingsForm.employer_job_form_config}
          onToggle={(fieldKey, updates) => updateSettingsFieldControl("employer_job_form_config", fieldKey, updates)}
        />
      </div>
    </form>
  );
}
