import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, Save, ChevronDown } from "lucide-react";
import { SectionHeader, Field, FieldControlMatrix } from "../shared/UIComponents";

function Collapsible({ title, description, children }) {
  const [open, setOpen] = React.useState(false);
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
      {open && <div className="border-t border-border/40">{children}</div>}
    </div>
  );
}
import { COMPANY_FIELD_GROUPS, JOB_FIELD_GROUPS, EMPLOYEE_FIELD_GROUPS, DEFAULT_SITE_SETTINGS, mergeSiteSettingsWithDefaults } from "@/lib/siteSettings";
import { queryKeys } from "../shared/constants";
import settingsService from "@/services/settings";
import { refreshSiteSettings } from "@/hooks/useSiteSettings";

function ProductCard({ product, updateProduct, removeProduct }) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <div className={`rounded-xl border overflow-hidden ${product.enabled !== false ? "border-border/50" : "border-border/30 opacity-60"}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${product.enabled !== false ? "bg-emerald-500" : "bg-muted-foreground"}`} />
          <p className="text-sm font-display font-semibold text-foreground">{product.name || "Unnamed Product"}</p>
          <Badge variant="outline" className="text-[0.55rem] rounded-md px-1.5 py-0 h-4 capitalize">{product.type?.replace("_", " ")}</Badge>
          {product.stripe_product_id && <span className="text-[0.55rem] text-muted-foreground hidden sm:inline">{product.stripe_product_id}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={product.enabled !== false} onCheckedChange={(v) => { updateProduct("enabled", v); }} onClick={(e) => e.stopPropagation()} />
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); removeProduct(); }}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>
      {expanded && (
        <div className="px-5 py-4 border-t border-border/40 grid gap-3 sm:grid-cols-2">
          <Field label="Product ID"><Input value={product.id} onChange={(e) => updateProduct("id", e.target.value)} className="h-9 text-sm" /></Field>
          <Field label="Name"><Input value={product.name || ""} onChange={(e) => updateProduct("name", e.target.value)} className="h-9 text-sm" /></Field>
          <Field label="Description" className="sm:col-span-2"><Input value={product.description || ""} onChange={(e) => updateProduct("description", e.target.value)} className="h-9 text-sm" /></Field>
          <Field label="Type">
            <Select value={product.type} onValueChange={(v) => updateProduct("type", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="listing">Listing</SelectItem>
                <SelectItem value="addon">Add-on</SelectItem>
                <SelectItem value="credit_bundle">Credit Bundle</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="cv_plan">CV Plan</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Stripe Product ID"><Input placeholder="prod_xxx" value={product.stripe_product_id || ""} onChange={(e) => updateProduct("stripe_product_id", e.target.value)} className="h-9 text-sm" /></Field>
          {(product.type === "listing" || product.type === "addon") && (
            <Field label="Credit Cost"><Input type="number" step="0.5" min="0" value={product.credit_cost ?? ""} onChange={(e) => updateProduct("credit_cost", Number(e.target.value) || 0)} className="h-9 text-sm" /></Field>
          )}
          {product.type === "credit_bundle" && (
            <Field label="Credits Granted"><Input type="number" min="0" value={product.credits ?? ""} onChange={(e) => updateProduct("credits", Number(e.target.value) || 0)} className="h-9 text-sm" /></Field>
          )}
          {product.type === "cv_plan" && (
            <Field label="CV Plan Tier">
              <Select value={product.cv_plan_tier || "professional"} onValueChange={(v) => updateProduct("cv_plan_tier", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
          {product.type === "listing" && (
            <Field label="Duration (days)"><Input type="number" min="1" value={product.duration ?? ""} onChange={(e) => updateProduct("duration", Number(e.target.value) || 30)} className="h-9 text-sm" /></Field>
          )}
          {product.type === "addon" && (
            <>
              <Field label="Icon">
                <Select value={product.icon || "zap"} onValueChange={(v) => updateProduct("icon", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="star">Star</SelectItem><SelectItem value="sparkles">Sparkles</SelectItem>
                    <SelectItem value="external-link">External Link</SelectItem><SelectItem value="copy">Copy</SelectItem>
                    <SelectItem value="zap">Zap</SelectItem><SelectItem value="briefcase">Briefcase</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Applies To">
                <Select value={product.appliesTo || "job"} onValueChange={(v) => updateProduct("appliesTo", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="job">Job Listing</SelectItem></SelectContent>
                </Select>
              </Field>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [settingsForm, setSettingsForm] = useState(() => mergeSiteSettingsWithDefaults(DEFAULT_SITE_SETTINGS));
  const [saving, setSaving] = useState(false);

  const settingsQuery = useQuery({ queryKey: queryKeys.settings, queryFn: () => settingsService.getSiteSettings() });

  useEffect(() => {
    if (!settingsQuery.isLoading && settingsQuery.data) {
      setSettingsForm(mergeSiteSettingsWithDefaults(settingsQuery.data));
    }
  }, [settingsQuery.isLoading, settingsQuery.dataUpdatedAt]);

  const updateSettingsFieldControl = (configKey, fieldKey, updates) => {
    setSettingsForm((c) => ({
      ...c,
      [configKey]: {
        ...(c?.[configKey] || {}),
        [fieldKey]: { ...(c?.[configKey]?.[fieldKey] || {}), ...updates, ...(updates.visible === false ? { required: false } : {}) },
      },
    }));
  };

  const set = (key, value) => setSettingsForm((c) => ({ ...c, [key]: value }));

  const onSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { id, ...payload } = settingsForm;
      await settingsService.updateSiteSettings(payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      await refreshSiteSettings();
      toast.success("Site settings updated");
    } catch (error) {
      toast.error(`Could not update settings — ${error.message || "Please try again."}`);
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={onSave} className="space-y-8">
      <SectionHeader
        title="Settings"
        description="Customize brand text, publishing rules, and form configurations."
        action={
          <Button type="submit" disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-9 text-sm font-medium">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
            Save Settings
          </Button>
        }
      />

      {/* Brand + Contact */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Collapsible title="Brand & Homepage" description="Logo, hero section text" defaultOpen={false}>
          <div className="px-6 py-5 grid gap-4">
            <Field label="Brand name"><Input value={settingsForm.brand_name} onChange={(e) => set("brand_name", e.target.value)} /></Field>
            <Field label="Hero eyebrow"><Input value={settingsForm.hero_eyebrow} onChange={(e) => set("hero_eyebrow", e.target.value)} /></Field>
            <Field label="Hero title"><Input value={settingsForm.hero_title} onChange={(e) => set("hero_title", e.target.value)} /></Field>
            <Field label="Hero highlight"><Input value={settingsForm.hero_highlight} onChange={(e) => set("hero_highlight", e.target.value)} /></Field>
            <Field label="Hero subtitle"><Textarea className="min-h-24 resize-none" value={settingsForm.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} /></Field>
          </div>
        </Collapsible>

        <Collapsible title="Contact & Rules" description="Contact info, publishing toggles" defaultOpen={false}>
          <div className="px-6 py-5 grid gap-4">
            <Field label="Contact email"><Input type="email" value={settingsForm.contact_email} onChange={(e) => set("contact_email", e.target.value)} /></Field>
            <Field label="Contact phone"><Input value={settingsForm.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} /></Field>
            <Field label="Office location"><Input value={settingsForm.office_location} onChange={(e) => set("office_location", e.target.value)} /></Field>
            <Field label="Footer blurb"><Textarea className="min-h-24 resize-none" value={settingsForm.footer_blurb} onChange={(e) => set("footer_blurb", e.target.value)} /></Field>
            <div className="pt-2 space-y-3">
              {[
                ["employer_approval_required", "Employer approval required"],
                ["job_approval_required", "Job approval required"],
              ].map(([field, label]) => (
                <div key={field} className="flex items-center justify-between gap-4 rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
                  <Label className="text-sm">{label}</Label>
                  <Switch checked={Boolean(settingsForm[field])} onCheckedChange={(checked) => set(field, checked)} />
                </div>
              ))}
            </div>
          </div>
        </Collapsible>
      </div>

      {/* Products */}
      <Collapsible title="Products" description="Listings, add-ons, credit bundles, and subscriptions">
        <div className="px-6 py-3 border-b border-border/30 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg h-8 text-xs font-medium"
            onClick={() => {
              const products = [...(settingsForm.products || [])];
              products.push({
                id: `product_${Date.now()}`, name: "", description: "", type: "addon",
                credit_cost: 0, credits: 0, stripe_product_id: "", icon: "zap",
                appliesTo: "job", duration: 0, enabled: true,
              });
              set("products", products);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
          </Button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {(settingsForm.products || []).map((product, index) => {
            const updateProduct = (key, value) => {
              const products = [...(settingsForm.products || [])];
              products[index] = { ...products[index], [key]: value };
              set("products", products);
            };
            const removeProduct = () => {
              set("products", (settingsForm.products || []).filter((_, i) => i !== index));
            };

            return (
              <ProductCard key={product.id || index} product={product} updateProduct={updateProduct} removeProduct={removeProduct} />
            );
          })}
          {!(settingsForm.products || []).length && (
            <div className="rounded-xl border border-dashed border-border/50 p-8 text-center text-sm text-muted-foreground">
              No products configured. Add a product to get started.
            </div>
          )}
        </div>
      </Collapsible>

      {/* Field Control Matrices */}
      <div className="grid gap-4 xl:grid-cols-2">
        <FieldControlMatrix
          title="Employer Company Form"
          description="Show, hide, and require fields on the employer profile form."
          groups={COMPANY_FIELD_GROUPS}
          value={settingsForm.employer_company_form_config}
          onToggle={(fieldKey, updates) => updateSettingsFieldControl("employer_company_form_config", fieldKey, updates)}
        />
        <FieldControlMatrix
          title="Employer Job Post Form"
          description="Control which fields employers see when creating or editing jobs."
          groups={JOB_FIELD_GROUPS}
          value={settingsForm.employer_job_form_config}
          onToggle={(fieldKey, updates) => updateSettingsFieldControl("employer_job_form_config", fieldKey, updates)}
        />
        <FieldControlMatrix
          title="Employee Profile Form"
          description="Control which fields job seekers see on their profile form."
          groups={EMPLOYEE_FIELD_GROUPS}
          value={settingsForm.employee_profile_form_config}
          onToggle={(fieldKey, updates) => updateSettingsFieldControl("employee_profile_form_config", fieldKey, updates)}
        />
        <FieldControlMatrix
          title="Candidate View (Employer)"
          description="Control which candidate fields are visible to employers in CV search."
          groups={EMPLOYEE_FIELD_GROUPS}
          value={settingsForm.employee_candidate_view_config}
          onToggle={(fieldKey, updates) => updateSettingsFieldControl("employee_candidate_view_config", fieldKey, updates)}
        />
      </div>
    </form>
  );
}
