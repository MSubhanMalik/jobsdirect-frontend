import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  ClipboardList,
  MessageSquare,
  CreditCard,
  UserCog,
  SlidersHorizontal,
} from "lucide-react";

export const ADMIN_ROLES = new Set(["admin"]);

export const queryKeys = {
  jobs: ["admin-jobs"],
  employers: ["admin-employers"],
  employees: ["admin-employees"],
  applications: ["admin-applications"],
  messages: ["admin-messages"],
  payments: ["admin-payments"],
  users: ["admin-users"],
  settings: ["admin-site-settings"],
};

export const statusMeta = {
  approved: { label: "Live", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  pending_review: { label: "Pending", className: "border-amber-200 bg-amber-50 text-amber-700" },
  rejected: { label: "Rejected", className: "border-red-200 bg-red-50 text-red-700" },
  draft: { label: "Draft", className: "border-slate-200 bg-slate-50 text-slate-700" },
  archived: { label: "Archived", className: "border-slate-200 bg-slate-100 text-slate-600" },
  submitted: { label: "Submitted", className: "border-blue-200 bg-blue-50 text-blue-700" },
  shortlisted: { label: "Shortlisted", className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
  hired: { label: "Hired", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  new: { label: "New", className: "border-blue-200 bg-blue-50 text-blue-700" },
  read: { label: "Read", className: "border-slate-200 bg-slate-50 text-slate-700" },
};

export const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, path: "overview" },
  { id: "jobs", label: "Jobs CMS", icon: Briefcase, path: "jobs" },
  { id: "companies", label: "Companies", icon: Building2, path: "companies" },
  { id: "candidates", label: "Candidates", icon: Users, path: "candidates" },
  { id: "applications", label: "Applications", icon: ClipboardList, path: "applications" },
  { id: "messages", label: "Messages", icon: MessageSquare, path: "messages" },
  { id: "payments", label: "Payments", icon: CreditCard, path: "payments" },
  { id: "users", label: "Users", icon: UserCog },
  { id: "settings", label: "Site CMS", icon: SlidersHorizontal, path: "settings" },
];
