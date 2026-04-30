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

      {/* ─── Products Catalog ─── */}
      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Products</CardTitle>
              <p className="text-sm text-muted-foreground">All purchasable items: listings, add-ons, credit bundles, subscriptions. Each product has a Stripe Product ID and credit cost.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const products = [...(settingsForm.products || [])];
                products.push({
                  id: `product_${Date.now()}`,
                  name: "",
                  description: "",
                  type: "addon",
                  creditCost: 0,
                  credits: 0,
                  stripeProductId: "",
                  icon: "zap",
                  appliesTo: "job",
                  duration: 0,
                  enabled: true,
                });
                setSettingsForm({ ...settingsForm, products });
              }}
            >
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(settingsForm.products || []).map((product, index) => {
            const updateProduct = (key, value) => {
              const products = [...(settingsForm.products || [])];
              products[index] = { ...products[index], [key]: value };
              setSettingsForm({ ...settingsForm, products });
            };
            const removeProduct = () => {
              const products = (settingsForm.products || []).filter((_, i) => i !== index);
              setSettingsForm({ ...settingsForm, products });
            };

            return (
              <div key={product.id || index} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={product.enabled !== false ? "default" : "secondary"}>
                      {product.enabled !== false ? "Active" : "Disabled"}
                    </Badge>
                    <Badge variant="outline">{product.type}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={product.enabled !== false} onCheckedChange={(v) => updateProduct("enabled", v)} />
                    <Button type="button" variant="ghost" size="icon" onClick={removeProduct}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Product ID">
                    <Input value={product.id} onChange={(e) => updateProduct("id", e.target.value)} />
                  </Field>
                  <Field label="Name">
                    <Input value={product.name || ""} onChange={(e) => updateProduct("name", e.target.value)} />
                  </Field>
                  <Field label="Description" className="sm:col-span-2">
                    <Input value={product.description || ""} onChange={(e) => updateProduct("description", e.target.value)} />
                  </Field>
                  <Field label="Type">
                    <Select value={product.type} onValueChange={(v) => updateProduct("type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="listing">Listing</SelectItem>
                        <SelectItem value="addon">Add-on</SelectItem>
                        <SelectItem value="credit_bundle">Credit Bundle</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Stripe Product ID">
                    <Input placeholder="prod_xxx" value={product.stripeProductId || ""} onChange={(e) => updateProduct("stripeProductId", e.target.value)} />
                  </Field>
                  {(product.type === "listing" || product.type === "addon") && (
                    <Field label="Credit Cost">
                      <Input type="number" step="0.5" min="0" value={product.creditCost ?? ""} onChange={(e) => updateProduct("creditCost", Number(e.target.value) || 0)} />
                    </Field>
                  )}
                  {product.type === "credit_bundle" && (
                    <Field label="Credits Granted">
                      <Input type="number" min="0" value={product.credits ?? ""} onChange={(e) => updateProduct("credits", Number(e.target.value) || 0)} />
                    </Field>
                  )}
                  {product.type === "listing" && (
                    <Field label="Duration (days)">
                      <Input type="number" min="1" value={product.duration ?? ""} onChange={(e) => updateProduct("duration", Number(e.target.value) || 30)} />
                    </Field>
                  )}
                  {product.type === "addon" && (
                    <>
                      <Field label="Icon">
                        <Select value={product.icon || "zap"} onValueChange={(v) => updateProduct("icon", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="star">Star</SelectItem>
                            <SelectItem value="sparkles">Sparkles</SelectItem>
                            <SelectItem value="external-link">External Link</SelectItem>
                            <SelectItem value="copy">Copy</SelectItem>
                            <SelectItem value="zap">Zap</SelectItem>
                            <SelectItem value="briefcase">Briefcase</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Applies To">
                        <Select value={product.appliesTo || "job"} onValueChange={(v) => updateProduct("appliesTo", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="job">Job Listing</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {!(settingsForm.products || []).length && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No products configured. Add a product to get started.
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
