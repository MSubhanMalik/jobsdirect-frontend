import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import authService from "@/services/auth";
import jobService from "@/services/job";
import employerService from "@/services/employer";
import employeeService from "@/services/employee";
import applicationService from "@/services/application";
import contactService from "@/services/contact";
import paymentService from "@/services/payment";
import adminService from "@/services/admin";
import settingsService from "@/services/settings";
import { refreshSiteSettings } from "@/hooks/useSiteSettings";
import FormFieldRenderer from "@/components/forms/FormFieldRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import { COMPANY_FIELD_GROUPS, JOB_FIELD_GROUPS, JOB_FIELDS, JOB_TYPE_OPTIONS, DEFAULT_SITE_SETTINGS, mergeSiteSettingsWithDefaults } from "@/lib/siteSettings";
import { CheckCircle2, Loader2, LogOut, Search, ShieldCheck } from "lucide-react";

import { ADMIN_ROLES, queryKeys, navItems } from "@/components/admin/shared/constants";
import { humanize, toNumber, splitList } from "@/components/admin/shared/helpers";
import { createJobForm, createEmployerForm, createEmployeeForm, createUserForm } from "@/components/admin/shared/forms";
import { Field } from "@/components/admin/shared/UIComponents";

import AdminOverview from "@/components/admin/sections/AdminOverview";
import AdminJobs from "@/components/admin/sections/AdminJobs";
import AdminEmployers from "@/components/admin/sections/AdminEmployers";
import AdminEmployees from "@/components/admin/sections/AdminEmployees";
import AdminApplications from "@/components/admin/sections/AdminApplications";
import AdminMessages from "@/components/admin/sections/AdminMessages";
import AdminPayments from "@/components/admin/sections/AdminPayments";
import AdminUsers from "@/components/admin/sections/AdminUsers";
import AdminSettings from "@/components/admin/sections/AdminSettings";


const defaultSiteSettings = mergeSiteSettingsWithDefaults(DEFAULT_SITE_SETTINGS);

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [authUser, setAuthUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeSection, setActiveSectionState] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return hash || "overview";
  });
  const setActiveSection = (section) => {
    setActiveSectionState(section);
    window.location.hash = section;
  };
  const [search, setSearch] = useState("");
  const [jobStatus, setJobStatus] = useState("all");
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [settingsForm, setSettingsForm] = useState(() => mergeSiteSettingsWithDefaults(defaultSiteSettings));

  useEffect(() => {
    const load = async () => {
      const authed = await authService.isAuthenticated();
      if (!authed) { authService.redirectToLogin("/admin"); return; }
      const me = await authService.getUserInfo();
      if (!ADMIN_ROLES.has(me.role)) { navigate("/dashboard"); return; }
      setAuthUser(me);
      setCheckingAuth(false);
    };
    load();
  }, [navigate]);

  const enabled = !checkingAuth;
  const jobsQuery = useQuery({ queryKey: queryKeys.jobs, queryFn: () => jobService.list({ pageSize: 100 }), enabled });
  const employersQuery = useQuery({ queryKey: queryKeys.employers, queryFn: () => employerService.list({ pageSize: 100 }), enabled });
  const employeesQuery = useQuery({ queryKey: queryKeys.employees, queryFn: () => employeeService.list({ pageSize: 100 }), enabled });
  const applicationsQuery = useQuery({ queryKey: queryKeys.applications, queryFn: () => applicationService.list({ pageSize: 100 }), enabled });
  const messagesQuery = useQuery({ queryKey: queryKeys.messages, queryFn: () => contactService.list(), enabled });
  const paymentsQuery = useQuery({ queryKey: queryKeys.payments, queryFn: () => paymentService.list(), enabled });
  const usersQuery = useQuery({ queryKey: queryKeys.users, queryFn: () => adminService.listUsers(), enabled });
  const settingsQuery = useQuery({ queryKey: queryKeys.settings, queryFn: () => settingsService.getSiteSettings(), enabled });

  const jobs = jobsQuery.data?.items || [];
  const employers = employersQuery.data?.items || [];
  const employees = employeesQuery.data?.items || [];
  const applications = applicationsQuery.data?.items || [];
  const messages = messagesQuery.data || [];
  const payments = paymentsQuery.data || [];
  const users = usersQuery.data || [];
  const siteSettings = settingsQuery.data || null;
  const dataLoading = [jobsQuery, employersQuery, employeesQuery, applicationsQuery, messagesQuery, paymentsQuery, usersQuery].some((q) => q.isLoading);

  useEffect(() => {
    if (!settingsQuery.isLoading && siteSettings) {
      setSettingsForm(mergeSiteSettingsWithDefaults(siteSettings));
    }
  }, [settingsQuery.isLoading, settingsQuery.dataUpdatedAt]);

  const stats = useMemo(() => {
    const pendingJobs = jobs.filter((j) => j.status === "pending_review").length;
    const liveJobs = jobs.filter((j) => j.status === "approved").length;
    const pendingEmployers = employers.filter((e) => ["pending", "submitted"].includes(e.verification_status)).length;
    const newMessages = messages.filter((m) => m.status === "new").length;
    const paidPayments = payments.filter((p) => p.payment_status === "paid");
    const revenue = paidPayments.reduce((sum, p) => sum + Number(p.amount_total || 0), 0);
    const subscriptions = payments.filter((p) => p.kind === "candidate_database" && p.payment_status === "paid").length;
    return { pendingJobs, liveJobs, pendingEmployers, newMessages, paidPayments: paidPayments.length, revenue, subscriptions };
  }, [jobs, employers, messages, payments]);

  const invalidate = (...keys) => keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

  const entityServices = { Job: jobService, Employer: employerService, Employee: employeeService, Application: applicationService, ContactMessage: contactService };

  const updateEntity = async (entity, id, updates, keys, title) => {
    await entityServices[entity].update(id, updates);
    invalidate(...keys);
    toast.success(title);
  };

  const openEditor = (entity, item = null) => {
    const form = {
      job: createJobForm(item || {}, employers),
      employer: createEmployerForm(item || {}),
      employee: createEmployeeForm(item || {}),
      user: createUserForm(item || {}),
    }[entity];
    setEditor({ entity, mode: item ? "edit" : "create", item, form });
  };

  const updateEditor = (field, value) => {
    setEditor((c) => ({ ...c, form: { ...c.form, [field]: value } }));
  };

  const updateSettingsFieldControl = (configKey, fieldKey, updates) => {
    setSettingsForm((c) => ({
      ...c,
      [configKey]: {
        ...(c?.[configKey] || {}),
        [fieldKey]: { ...(c?.[configKey]?.[fieldKey] || {}), ...updates, ...(updates.visible === false ? { required: false } : {}) },
      },
    }));
  };

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
        };
        if (editor.mode === "edit") await jobService.update(editor.item.id, payload);
        else await jobService.create(payload);
        invalidate(queryKeys.jobs);
      }
      if (editor.entity === "employer") {
        if (editor.mode === "edit") await employerService.update(editor.item.id, editor.form);
        else await employerService.create(editor.form);
        invalidate(queryKeys.employers);
      }
      if (editor.entity === "employee") {
        const payload = { ...editor.form, skills: splitList(editor.form.skills) };
        if (editor.mode === "edit") await employeeService.update(editor.item.id, payload);
        else await employeeService.create(payload);
        invalidate(queryKeys.employees);
      }
      if (editor.entity === "user") {
        const payload = { ...editor.form };
        if (editor.mode === "edit") { delete payload.email; if (!payload.password) delete payload.password; await adminService.updateUser(editor.item.id, payload); }
        else await adminService.createUser(payload);
        invalidate(queryKeys.users);
      }
      toast.success(editor.mode === "edit" ? "Changes saved" : "Record created");
      setEditor(null);
    } catch (error) {
      toast.error(`Could not save — ${error.message || "Please check the details and try again."}`);
    } finally { setSaving(false); }
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      // Send the full settings form — don't leak non-setting fields like id
      const { id, ...payload } = settingsForm;
      await settingsService.updateSiteSettings(payload);
      invalidate(queryKeys.settings);
      await refreshSiteSettings();
      toast.success("Site settings updated");
    } catch (error) {
      toast.error(`Could not update settings — ${error.message || "Please try again."}`);
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    setSaving(true);
    try {
      if (deleteDialog.kind === "user") { await adminService.deleteUser(deleteDialog.id); invalidate(queryKeys.users); }
      else { await entityServices[deleteDialog.entity].remove(deleteDialog.id); invalidate(...deleteDialog.keys); }
      toast.success(`Deleted — ${deleteDialog.label}`);
      setDeleteDialog(null);
    } catch (error) {
      toast.error(`Could not delete — ${error.message || "Please try again."}`);
    } finally { setSaving(false); }
  };

  const renderEditorFields = () => {
    if (!editor) return null;

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
              <div><h3 className="text-sm font-semibold">{group.title}</h3>{group.description ? <p className="text-xs text-muted-foreground">{group.description}</p> : null}</div>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.fields.map((field) => <FormFieldRenderer key={field.key} field={field} value={editor.form[field.key]} onChange={(v) => updateEditor(field.key, v)} required={requiredKeys.has(field.key)} />)}
              </div>
            </section>
          ))}
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
              <div><h3 className="text-sm font-semibold">{group.title}</h3>{group.description ? <p className="text-xs text-muted-foreground">{group.description}</p> : null}</div>
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
          <div className="flex items-center justify-between rounded-lg border p-3"><Label>Profile complete</Label><Switch checked={editor.form.profile_completed} onCheckedChange={(c) => updateEditor("profile_completed", c)} /></div>
          <div className="flex items-center justify-between rounded-lg border p-3"><Label>Searchable</Label><Switch checked={editor.form.is_searchable} onCheckedChange={(c) => updateEditor("is_searchable", c)} /></div>
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
          <div className="flex items-center justify-between rounded-lg border p-3"><Label>Email verified</Label><Switch checked={editor.form.email_verified} onCheckedChange={(c) => updateEditor("email_verified", c)} /></div>
        </div>
      );
    }
    return null;
  };

  const sectionProps = { search, setSearch, openEditor, updateEntity, setDeleteDialog, queryKeys, invalidate };

  const renderActiveSection = () => ({
    overview: <AdminOverview stats={stats} jobs={jobs} employers={employers} applications={applications} messages={messages} payments={payments} {...sectionProps} />,
    jobs: <AdminJobs jobs={jobs} employers={employers} jobStatus={jobStatus} setJobStatus={setJobStatus} {...sectionProps} />,
    employers: <AdminEmployers employers={employers} {...sectionProps} />,
    employees: <AdminEmployees employees={employees} {...sectionProps} />,
    applications: <AdminApplications applications={applications} {...sectionProps} />,
    messages: <AdminMessages messages={messages} {...sectionProps} />,
    payments: <AdminPayments payments={payments} stats={stats} search={search} />,
    users: <AdminUsers users={users} authUser={authUser} {...sectionProps} />,
    settings: <AdminSettings settingsForm={settingsForm} setSettingsForm={setSettingsForm} siteSettings={siteSettings} saving={saving} onSave={saveSettings} updateSettingsFieldControl={updateSettingsFieldControl} />,
  }[activeSection]);

  if (checkingAuth || dataLoading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid gap-4 md:grid-cols-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const navCounts = { jobs: stats.pendingJobs, employers: stats.pendingEmployers, messages: stats.newMessages, applications: applications.length, payments: payments.length, users: users.length };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex min-h-16 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><ShieldCheck className="h-5 w-5" /></div>
            <div><h1 className="text-lg font-semibold leading-tight">Admin CMS</h1><p className="text-xs text-muted-foreground">JobsDirect operations dashboard</p></div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search current workspace" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{humanize(authUser?.role)}</Badge>
              <Button variant="outline" size="sm" onClick={() => authService.logout("/")}><LogOut className="h-4 w-4" />Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[260px_1fr]">
        <aside className="border-b bg-background lg:min-h-[calc(100vh-65px)] lg:border-b-0 lg:border-r">
          <div className="sticky top-16 space-y-6 p-4">
            <nav className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button key={item.id} type="button" onClick={() => setActiveSection(item.id)}
                    className={`flex h-10 items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                    <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{item.label}</span>
                    {navCounts[item.id] ? <Badge variant={isActive ? "secondary" : "outline"} className="h-5 px-1.5 text-[10px]">{navCounts[item.id]}</Badge> : null}
                  </button>
                );
              })}
            </nav>
            <Separator />
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">Signed in as</p>
              <p className="mt-2 truncate text-sm font-medium">{authUser?.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">{authUser?.email}</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{renderActiveSection()}</div>
        </main>
      </div>

      {/* Entity Editor Sheet */}
      <Sheet open={!!editor} onOpenChange={(open) => { if (!open) setEditor(null); }}>
        <SheetContent className="w-full p-0 sm:max-w-2xl">
          <form onSubmit={saveEditor} className="flex h-full flex-col">
            <SheetHeader className="border-b p-6">
              <SheetTitle>{editor?.mode === "edit" ? "Edit" : "Create"} {humanize(editor?.entity)}</SheetTitle>
              <SheetDescription>Changes are saved directly to the CMS store.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1"><div className="p-6">{renderEditorFields()}</div></ScrollArea>
            <SheetFooter className="border-t p-4">
              <Button type="button" variant="outline" onClick={() => setEditor(null)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Save</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => { if (!open) setDeleteDialog(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>{deleteDialog?.label ? `"${deleteDialog.label}" will be removed from the CMS.` : "This record will be removed from the CMS."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete} disabled={saving}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
