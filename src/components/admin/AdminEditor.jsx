import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle2, Loader2 } from "lucide-react";
import FormFieldRenderer from "@/components/forms/FormFieldRenderer";
import { Field } from "@/components/admin/shared/UIComponents";
import { humanize, toNumber, splitList } from "@/components/admin/shared/helpers";
import { createJobForm, createEmployerForm, createEmployeeForm, createUserForm } from "@/components/admin/shared/forms";
import { queryKeys } from "@/components/admin/shared/constants";
import { COMPANY_FIELD_GROUPS, JOB_FIELD_GROUPS, JOB_TYPE_OPTIONS } from "@/lib/siteSettings";
import jobService from "@/services/job";
import employerService from "@/services/employer";
import employeeService from "@/services/employee";
import adminService from "@/services/admin";
import { useProducts } from "@/hooks/useProducts";
import { Checkbox } from "@/components/ui/checkbox";
import ProductIcon from "@/components/products/ProductIcon";
import { Badge } from "@/components/ui/badge";

export function useAdminEditor() {
  const [editor, setEditor] = useState(null);

  const openEditor = (entity, item = null, extras = {}) => {
    const form = {
      job: createJobForm(item || {}, extras.employers || []),
      employer: createEmployerForm(item || {}),
      employee: createEmployeeForm(item || {}),
      user: createUserForm(item || {}),
    }[entity];
    setEditor({ entity, mode: item ? "edit" : "create", item, form, extras });
  };

  return { editor, setEditor, openEditor };
}

export default function AdminEditor({ editor, setEditor }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const { addons: addonProducts } = useProducts();
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Initialize selected addons when editor opens with a job
  React.useEffect(() => {
    if (editor?.entity === "job" && editor.item?.active_addons) {
      setSelectedAddons(editor.item.active_addons.map((a) => a.id));
    } else {
      setSelectedAddons([]);
    }
  }, [editor?.item?.id, editor?.entity]);

  if (!editor) return null;

  const updateEditor = (field, value) => {
    setEditor((c) => ({ ...c, form: { ...c.form, [field]: value } }));
  };

  const employers = editor.extras?.employers || [];

  const saveEditor = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editor.entity === "job") {
        const selectedEmployer = employers.find((e) => e.id === editor.form.employer_id);
        const payload = {
          ...editor.form,
          company_name: editor.form.company_name || selectedEmployer?.company_name || "Direct listing",
          employer_id: editor.form.employer_id || selectedEmployer?.id || "",
          salary_min: toNumber(editor.form.salary_min),
          salary_max: toNumber(editor.form.salary_max),
          hours_per_week: toNumber(editor.form.hours_per_week),
          positions_count: toNumber(editor.form.positions_count),
          addons: selectedAddons,
        };
        if (editor.mode === "edit") await jobService.update(editor.item.id, payload);
        else await jobService.create(payload);
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      }
      if (editor.entity === "employer") {
        if (editor.mode === "edit") await employerService.update(editor.item.id, editor.form);
        else await employerService.create(editor.form);
        queryClient.invalidateQueries({ queryKey: queryKeys.employers });
      }
      if (editor.entity === "employee") {
        const payload = { ...editor.form, skills: splitList(editor.form.skills) };
        if (editor.mode === "edit") await employeeService.update(editor.item.id, payload);
        else await employeeService.create(payload);
        queryClient.invalidateQueries({ queryKey: queryKeys.employees });
      }
      if (editor.entity === "user") {
        const payload = { ...editor.form };
        if (editor.mode === "edit") { delete payload.email; if (!payload.password) delete payload.password; await adminService.updateUser(editor.item.id, payload); }
        else await adminService.createUser(payload);
        queryClient.invalidateQueries({ queryKey: queryKeys.users });
      }
      toast.success(editor.mode === "edit" ? "Changes saved" : "Record created");
      setEditor(null);
    } catch (error) {
      toast.error(`Could not save — ${error.message || "Please try again."}`);
    } finally { setSaving(false); }
  };

  const renderFields = () => {
    if (editor.entity === "job") {
      const requiredKeys = new Set(["title", "description", "location"]);
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company">
              <Select value={editor.form.employer_id || "manual"} onValueChange={(v) => {
                const emp = employers.find((e) => e.id === v);
                updateEditor("employer_id", v === "manual" ? "" : v);
                updateEditor("company_name", emp?.company_name || editor.form.company_name);
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Direct listing</SelectItem>
                  {employers.map((e) => <SelectItem key={e.id} value={e.id}>{e.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Company name"><Input required value={editor.form.company_name} onChange={(e) => updateEditor("company_name", e.target.value)} /></Field>
          </div>
          {JOB_FIELD_GROUPS.map((group) => (
            <section key={group.id} className="space-y-4">
              <div className="border-b border-border/30 pb-2">
                <h3 className="text-sm font-display font-semibold text-foreground">{group.title}</h3>
                {group.description && <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.fields.map((field) => <FormFieldRenderer key={field.key} field={field} value={editor.form[field.key]} onChange={(v) => updateEditor(field.key, v)} required={requiredKeys.has(field.key)} />)}
              </div>
            </section>
          ))}

          {/* Addons */}
          <section className="space-y-4">
            <div className="border-b border-border/30 pb-2">
              <h3 className="text-sm font-display font-semibold text-foreground">Addons</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Toggle addons for this listing.</p>
            </div>
            <div className="space-y-2">
              {addonProducts.filter((a) => a.appliesTo === "job").map((addon) => (
                <label key={addon.id} className={`flex items-center gap-3 cursor-pointer rounded-xl border p-3.5 transition-colors ${
                  selectedAddons.includes(addon.id) ? "border-accent/30 bg-accent/[0.03]" : "border-border/40 hover:bg-muted/30"
                }`}>
                  <Checkbox
                    checked={selectedAddons.includes(addon.id)}
                    onCheckedChange={(v) => {
                      setSelectedAddons((prev) => v ? [...prev, addon.id] : prev.filter((id) => id !== addon.id));
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      <ProductIcon name={addon.icon} className="w-3.5 h-3.5" /> {addon.name}
                    </span>
                    {addon.description && <p className="text-xs text-muted-foreground mt-0.5">{addon.description}</p>}
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedAddons.includes(addon.id) ? "bg-accent" : "bg-border"}`} />
                </label>
              ))}
            </div>
          </section>
        </div>
      );
    }
    if (editor.entity === "employer") {
      const requiredKeys = new Set(["company_name", "first_name", "last_name"]);
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" className="sm:col-span-2"><Input type="email" value={editor.form.user_email} onChange={(e) => updateEditor("user_email", e.target.value)} /></Field>
          </div>
          {COMPANY_FIELD_GROUPS.map((group) => (
            <section key={group.id} className="space-y-4">
              <div className="border-b border-border/30 pb-2">
                <h3 className="text-sm font-display font-semibold text-foreground">{group.title}</h3>
                {group.description && <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.fields.map((field) => <FormFieldRenderer key={field.key} field={field} value={editor.form[field.key]} onChange={(v) => updateEditor(field.key, v)} required={requiredKeys.has(field.key)} />)}
              </div>
            </section>
          ))}
        </div>
      );
    }
    if (editor.entity === "employee") {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name"><Input required value={editor.form.first_name} onChange={(e) => updateEditor("first_name", e.target.value)} /></Field>
          <Field label="Last name"><Input required value={editor.form.last_name} onChange={(e) => updateEditor("last_name", e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={editor.form.user_email} onChange={(e) => updateEditor("user_email", e.target.value)} /></Field>
          <Field label="Phone"><Input value={editor.form.phone} onChange={(e) => updateEditor("phone", e.target.value)} /></Field>
          <Field label="Current title"><Input value={editor.form.title} onChange={(e) => updateEditor("title", e.target.value)} /></Field>
          <Field label="Location"><Input value={editor.form.location} onChange={(e) => updateEditor("location", e.target.value)} /></Field>
          <Field label="Desired job type">
            <Select value={editor.form.desired_job_type} onValueChange={(v) => updateEditor("desired_job_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{JOB_TYPE_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Availability">
            <Select value={editor.form.availability} onValueChange={(v) => updateEditor("availability", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="immediately">Immediately</SelectItem>
                <SelectItem value="two_weeks">Two weeks</SelectItem>
                <SelectItem value="one_month">One month</SelectItem>
                <SelectItem value="negotiable">Negotiable</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Skills" className="sm:col-span-2"><Input value={editor.form.skills} onChange={(e) => updateEditor("skills", e.target.value)} /></Field>
          <Field label="Bio" className="sm:col-span-2"><Textarea className="min-h-28" value={editor.form.bio} onChange={(e) => updateEditor("bio", e.target.value)} /></Field>
          <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3"><Label>Profile complete</Label><Switch checked={editor.form.profile_completed} onCheckedChange={(c) => updateEditor("profile_completed", c)} /></div>
          <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3"><Label>Searchable</Label><Switch checked={editor.form.is_searchable} onCheckedChange={(c) => updateEditor("is_searchable", c)} /></div>
        </div>
      );
    }
    if (editor.entity === "user") {
      return (
        <div className="grid gap-4">
          <Field label="Full name"><Input required value={editor.form.full_name} onChange={(e) => updateEditor("full_name", e.target.value)} /></Field>
          <Field label="Email"><Input required disabled={editor.mode === "edit"} type="email" value={editor.form.email} onChange={(e) => updateEditor("email", e.target.value)} /></Field>
          <Field label="Role">
            <Select value={editor.form.role} onValueChange={(v) => updateEditor("role", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="employee">Employee</SelectItem><SelectItem value="employer">Employer</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
            </Select>
          </Field>
          <Field label={editor.mode === "edit" ? "New password" : "Password"}><Input type="password" required={editor.mode === "create"} value={editor.form.password} onChange={(e) => updateEditor("password", e.target.value)} /></Field>
          <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3"><Label>Email verified</Label><Switch checked={editor.form.email_verified} onCheckedChange={(c) => updateEditor("email_verified", c)} /></div>
        </div>
      );
    }
    return null;
  };

  return (
    <Sheet open={!!editor} onOpenChange={(open) => { if (!open) setEditor(null); }}>
      <SheetContent className="w-full p-0 sm:max-w-2xl border-l border-border/50">
        <form onSubmit={saveEditor} className="flex h-full flex-col">
          <SheetHeader className="border-b border-border/40 px-6 py-5">
            <SheetTitle className="font-display text-lg">{editor.mode === "edit" ? "Edit" : "Create"} {humanize(editor.entity)}</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">Changes are saved directly to the database.</SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1"><div className="p-6">{renderFields()}</div></ScrollArea>
          <SheetFooter className="border-t border-border/40 px-6 py-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setEditor(null)} className="rounded-lg">Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
