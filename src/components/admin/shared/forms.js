import {
  COMPANY_FIELDS,
  JOB_FIELDS,
  EMPLOYER_EDITOR_DEFAULTS,
  JOB_EDITOR_DEFAULTS,
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
  return {
    first_name: employee.first_name || "",
    last_name: employee.last_name || "",
    user_email: employee.user_email || "",
    phone: employee.phone || "",
    title: employee.title || "",
    location: employee.location || employee.desired_location || "",
    bio: employee.bio || "",
    skills: Array.isArray(employee.skills) ? employee.skills.join(", ") : employee.skills || "",
    desired_job_type: employee.desired_job_type || "full_time",
    availability: employee.availability || "negotiable",
    profile_completed: Boolean(employee.profile_completed),
    is_searchable: employee.is_searchable !== false,
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
