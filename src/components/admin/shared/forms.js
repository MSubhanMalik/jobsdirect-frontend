import {
  COMPANY_FIELDS,
  JOB_FIELDS,
  EMPLOYEE_FIELDS,
  EMPLOYER_EDITOR_DEFAULTS,
  JOB_EDITOR_DEFAULTS,
  EMPLOYEE_EDITOR_DEFAULTS,
  buildEntityFormValues,
} from "@/lib/siteSettings";

export function createJobForm(job = {}, employers = []) {
  const firstEmployer = employers[0] || {};
  const formValues = buildEntityFormValues(JOB_EDITOR_DEFAULTS, JOB_FIELDS, job);
  return {
    ...formValues,
    company_name: job.company_name || firstEmployer.company_name || "",
    employer_id: job.employer_id || firstEmployer.id || "",
  };
}

export function createEmployerForm(employer = {}) {
  const formValues = buildEntityFormValues(EMPLOYER_EDITOR_DEFAULTS, COMPANY_FIELDS, employer);
  return {
    ...formValues,
    user_email: employer.user_email || "",
  };
}

export function createEmployeeForm(employee = {}) {
  const formValues = buildEntityFormValues(EMPLOYEE_EDITOR_DEFAULTS, EMPLOYEE_FIELDS, employee);
  return {
    ...formValues,
    user_email: employee.user_email || "",
    profile_completed: Boolean(employee.profile_completed),
  };
}

export function createUserForm(user = {}) {
  return {
    full_name: user.full_name || "",
    email: user.email || "",
    role: user.role || "employee",
    email_verified: user.email_verified !== false,
    password: "",
  };
}
