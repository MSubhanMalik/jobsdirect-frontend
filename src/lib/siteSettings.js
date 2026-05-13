export const PHONE_TYPE_OPTIONS = [
  { value: "landline", label: "Landline" },
  { value: "mobile", label: "Mobile" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other", label: "Other" },
];

export const BUSINESS_TYPE_OPTIONS = [
  { value: "limited_company", label: "Limited Company" },
  { value: "sole_trader", label: "Sole Trader" },
  { value: "partnership", label: "Partnership" },
  { value: "public_body", label: "Public Body" },
  { value: "charity", label: "Charity" },
  { value: "other", label: "Other" },
];

export const COMPANY_SIZE_OPTIONS = [
  { value: "micro_0_10", label: "Micro 0 - 10" },
  { value: "small_11_50", label: "Small 11 - 50" },
  { value: "medium_51_250", label: "Medium 51 - 250" },
  { value: "large_251_1000", label: "Large 251 - 1000" },
  { value: "enterprise_1000_plus", label: "Enterprise 1000+" },
];

export const JOB_TYPE_OPTIONS = [
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
];

export const CONTRACT_TYPE_OPTIONS = [
  { value: "permanent_full_time", label: "Permanent full-time" },
  { value: "permanent_part_time", label: "Permanent part-time" },
  { value: "fixed_term", label: "Fixed term" },
  { value: "temporary", label: "Temporary" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export const CATEGORY_OPTIONS = [
  { value: "agriculture_forestry_fishing", label: "Agriculture, Forestry and Fishing" },
  { value: "mining_quarrying", label: "Mining and Quarrying" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "electricity_gas", label: "Electricity, Gas, Steam and Air Conditioning Supply" },
  { value: "water_waste", label: "Water Supply; Sewerage, Waste Management" },
  { value: "construction", label: "Construction" },
  { value: "wholesale_retail", label: "Wholesale and Retail Trade" },
  { value: "transportation_storage", label: "Transportation and Storage" },
  { value: "accommodation_food", label: "Accommodation and Food Service" },
  { value: "information_communication", label: "Information and Communication" },
  { value: "financial_insurance", label: "Financial and Insurance" },
  { value: "real_estate", label: "Real Estate" },
  { value: "professional_scientific", label: "Professional, Scientific and Technical" },
  { value: "admin_support", label: "Administrative and Support Service" },
  { value: "public_admin_defence", label: "Public Administration and Defence" },
  { value: "education", label: "Education" },
  { value: "health_social", label: "Human Health and Social Work" },
  { value: "arts_entertainment", label: "Arts, Entertainment and Recreation" },
  { value: "other_services", label: "Other Service Activities" },
  { value: "extraterritorial", label: "Extraterritorial Organisations" },
  { value: "other", label: "Other" },
];

export const CAREER_LEVEL_OPTIONS = [
  { value: "not_required", label: "Not required" },
  { value: "entry_level", label: "Entry level" },
  { value: "junior", label: "Junior" },
  { value: "mid_level", label: "Mid level" },
  { value: "senior", label: "Senior" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
  { value: "executive", label: "Executive" },
];

export const SALARY_MODE_OPTIONS = [
  { value: "not_specified", label: "Not specified" },
  { value: "fixed", label: "Fixed salary" },
  { value: "range", label: "Salary range" },
];

export const SALARY_PERIOD_OPTIONS = [
  { value: "annual", label: "Annual" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "hourly", label: "Hourly" },
];

export const APPLICATION_METHOD_OPTIONS = [
  { value: "platform", label: "Apply on Platform" },
  { value: "external", label: "External URL" },
];

import { LOCATION_OPTIONS as _LOCATION_OPTIONS, COUNTY_OPTIONS as _COUNTY_OPTIONS } from "./locations";
export const LOCATION_OPTIONS = _LOCATION_OPTIONS;
export const COUNTY_OPTIONS = _COUNTY_OPTIONS;

export const REMOTE_WORK_MODE_OPTIONS = [
  { value: "on_site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
  { value: "blended", label: "Blended" },
];

const field = (key, config) => ({
  key,
  span: 1,
  manageInEmployerForm: true,
  supportsRequired: config.type !== "boolean",
  ...config,
});

export const COMPANY_FIELD_GROUPS = [
  {
    id: "contact_person",
    title: "Contact Person",
    description: "Primary contact for this employer account.",
    fields: [
      field("first_name", { label: "Contact Name (First)", type: "text", defaultValue: "", employerDefaultVisible: true, employerDefaultRequired: true }),
      field("last_name", { label: "Contact Name (Last)", type: "text", defaultValue: "", employerDefaultVisible: true, employerDefaultRequired: true }),
      field("phone", { label: "Phone", type: "phone", defaultValue: "", employerDefaultVisible: true, employerDefaultRequired: true }),
    ],
  },
  {
    id: "company_details",
    title: "Company Details",
    description: "Required for verification and publishing jobs.",
    fields: [
      field("employer_number", { label: "Employer Registration No. (Revenue)", type: "text", defaultValue: "", employerDefaultVisible: true, employerDefaultRequired: true, placeholder: "Required for verification" }),
      field("website", { label: "Website", type: "url", defaultValue: "", employerDefaultVisible: true, placeholder: "https://company.ie" }),
    ],
  },
  {
    id: "admin",
    title: "Admin Controls",
    description: "Admin only controls.",
    fields: [
      field("verification_status", { label: "Verification Status", type: "select", options: [
        { value: "draft", label: "Draft" },
        { value: "pending", label: "Pending" },
        { value: "submitted", label: "Submitted" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ], defaultValue: "draft", adminOnly: true, manageInEmployerForm: false }),
      field("admin_review_note", { label: "Admin Review Note", type: "textarea", defaultValue: "", span: 2, adminOnly: true, manageInEmployerForm: false }),
    ],
  },
];

export const SECTOR_OPTIONS = [
  { value: "agriculture", label: "Agriculture & Farming" },
  { value: "construction", label: "Construction & Trades" },
  { value: "education", label: "Education & Training" },
  { value: "engineering", label: "Engineering" },
  { value: "finance", label: "Finance & Accounting" },
  { value: "healthcare", label: "Healthcare & Medical" },
  { value: "hospitality", label: "Hospitality & Tourism" },
  { value: "it", label: "IT & Technology" },
  { value: "legal", label: "Legal" },
  { value: "logistics", label: "Logistics & Transport" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "marketing", label: "Marketing & PR" },
  { value: "media", label: "Media & Creative" },
  { value: "pharma", label: "Pharmaceutical & Science" },
  { value: "property", label: "Property & Real Estate" },
  { value: "public_sector", label: "Public Sector & Government" },
  { value: "retail", label: "Retail & Sales" },
  { value: "social_care", label: "Social Care & Community" },
  { value: "telecoms", label: "Telecoms & Utilities" },
  { value: "other", label: "Other" },
];

export const JOB_FIELD_GROUPS = [
  {
    id: "classification",
    title: "Classification",
    description: "How the role should be categorized.",
    fields: [
      field("location", { label: "Location", type: "select", options: LOCATION_OPTIONS, defaultValue: "", employerDefaultVisible: true, employerDefaultRequired: true, searchable: true }),
      field("sector", { label: "Sector", type: "select", options: SECTOR_OPTIONS, defaultValue: "", employerDefaultVisible: true }),
      field("job_type", { label: "Job Type", type: "select", options: JOB_TYPE_OPTIONS, defaultValue: "full_time", employerDefaultVisible: true }),
      field("remote_work_mode", { label: "Work Type", type: "select", options: REMOTE_WORK_MODE_OPTIONS, defaultValue: "on_site", employerDefaultVisible: true }),
    ],
  },
  {
    id: "basic_details",
    title: "Job Information",
    description: "Core details about the role.",
    fields: [
      field("title", { label: "Job Title", type: "text", defaultValue: "", employerDefaultVisible: true, employerDefaultRequired: true, span: 2 }),
      field("description", { label: "Job Description", type: "textarea", defaultValue: "", employerDefaultVisible: true, employerDefaultRequired: true, span: 2 }),
    ],
  },
  {
    id: "compensation",
    title: "Compensation",
    description: "Salary details in EUR.",
    fields: [
      field("salary_min", { label: "Salary Min (EUR)", type: "number", defaultValue: "", employerDefaultVisible: true }),
      field("salary_max", { label: "Salary Max (EUR)", type: "number", defaultValue: "", employerDefaultVisible: true }),
      field("salary_period", { label: "Salary Period", type: "select", options: SALARY_PERIOD_OPTIONS, defaultValue: "annual", employerDefaultVisible: true }),
    ],
  },
  {
    id: "requirements",
    title: "Requirements",
    description: "Skills and qualifications needed.",
    fields: [
      field("requirements", { label: "Required Skills", type: "tags", defaultValue: [], employerDefaultVisible: true, span: 2, placeholder: "Type a skill and press Enter" }),
    ],
  },
  {
    id: "applications",
    title: "Application Method",
    description: "How candidates apply for this role.",
    fields: [
      field("application_method", { label: "Application Method", type: "select", options: APPLICATION_METHOD_OPTIONS, defaultValue: "platform", employerDefaultVisible: true }),
      field("application_url", { label: "External Application URL", type: "url", defaultValue: "", employerDefaultVisible: true, placeholder: "https://company.ie/careers/apply", showWhen: { field: "application_method", value: "external" } }),
    ],
  },
  {
    id: "admin",
    title: "Admin Controls",
    description: "Admin only controls.",
    fields: [
      field("status", { label: "Status", type: "select", options: [
        { value: "approved", label: "Live" },
        { value: "pending_review", label: "Pending" },
        { value: "flagged", label: "Flagged" },
        { value: "rejected", label: "Rejected" },
        { value: "draft", label: "Draft" },
        { value: "archived", label: "Archived" },
      ], defaultValue: "pending_review", adminOnly: true, manageInEmployerForm: false }),
      field("source", { label: "Source", type: "text", defaultValue: "manual", adminOnly: true, manageInEmployerForm: false }),
    ],
  },
];

export const RIGHT_TO_WORK_OPTIONS = [
  { value: "irish_citizen", label: "Irish Citizen" },
  { value: "eu_citizen", label: "EU Citizen" },
  { value: "work_permit", label: "Work Permit" },
  { value: "stamp_4", label: "Stamp 4" },
  { value: "other", label: "Other" },
];

export const DRIVING_LICENCE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "full_b", label: "Full B (Car)" },
  { value: "provisional", label: "Provisional" },
  { value: "full_c", label: "Full C (Truck)" },
  { value: "full_d", label: "Full D (Bus)" },
  { value: "motorcycle", label: "Motorcycle" },
];

export const AVAILABILITY_OPTIONS = [
  { value: "immediately", label: "Immediately" },
  { value: "1_week", label: "1 Week" },
  { value: "2_weeks", label: "2 Weeks" },
  { value: "1_month", label: "1 Month" },
  { value: "negotiable", label: "Negotiable" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const EMPLOYEE_FIELD_GROUPS = [
  {
    id: "personal_info",
    title: "Personal Information",
    description: "Your basic contact and identity details.",
    fields: [
      field("first_name", { label: "First Name", type: "text", defaultValue: "", employerDefaultVisible: true, employerDefaultRequired: true }),
      field("last_name", { label: "Last Name", type: "text", defaultValue: "", employerDefaultVisible: true, employerDefaultRequired: true }),
      field("phone", { label: "Phone", type: "phone", defaultValue: "", employerDefaultVisible: true }),
      field("county", { label: "County", type: "select", options: COUNTY_OPTIONS, defaultValue: "", employerDefaultVisible: true, searchable: true }),
      field("right_to_work", { label: "Right to Work", type: "select", options: RIGHT_TO_WORK_OPTIONS, defaultValue: "", employerDefaultVisible: true }),
      field("driving_licence", { label: "Driving Licence", type: "select", options: DRIVING_LICENCE_OPTIONS, defaultValue: "none", employerDefaultVisible: true }),
      field("languages", { label: "Languages", type: "text", defaultValue: "", employerDefaultVisible: true, span: 2, placeholder: "e.g. English (fluent), Irish, Polish" }),
    ],
  },
];

const flattenFields = (groups) => groups.flatMap((group) => group.fields);

export const COMPANY_FIELDS = flattenFields(COMPANY_FIELD_GROUPS);
export const JOB_FIELDS = flattenFields(JOB_FIELD_GROUPS);
export const EMPLOYEE_FIELDS = flattenFields(EMPLOYEE_FIELD_GROUPS);

const buildFormDefaults = (fields) =>
  fields.reduce((acc, currentField) => {
    acc[currentField.key] = currentField.defaultValue;
    return acc;
  }, {});

export const EMPLOYER_FORM_DEFAULTS = buildFormDefaults(COMPANY_FIELDS.filter((currentField) => !currentField.adminOnly));
export const EMPLOYER_EDITOR_DEFAULTS = buildFormDefaults(COMPANY_FIELDS);
export const JOB_FORM_DEFAULTS = buildFormDefaults(JOB_FIELDS.filter((currentField) => !currentField.adminOnly));
export const JOB_EDITOR_DEFAULTS = buildFormDefaults(JOB_FIELDS);
export const EMPLOYEE_EDITOR_DEFAULTS = buildFormDefaults(EMPLOYEE_FIELDS);

export const EMPLOYER_COMPANY_FORM_CONTROL_DEFAULTS = COMPANY_FIELDS
  .filter((currentField) => currentField.manageInEmployerForm && !currentField.adminOnly)
  .reduce((acc, currentField) => {
    acc[currentField.key] = {
      visible: currentField.employerDefaultVisible !== false,
      required: currentField.supportsRequired !== false && Boolean(currentField.employerDefaultRequired),
    };
    return acc;
  }, {});

export const EMPLOYER_JOB_FORM_CONTROL_DEFAULTS = JOB_FIELDS
  .filter((currentField) => currentField.manageInEmployerForm && !currentField.adminOnly)
  .reduce((acc, currentField) => {
    acc[currentField.key] = {
      visible: currentField.employerDefaultVisible !== false,
      required: currentField.supportsRequired !== false && Boolean(currentField.employerDefaultRequired),
    };
    return acc;
  }, {});

export const EMPLOYEE_PROFILE_FORM_CONTROL_DEFAULTS = EMPLOYEE_FIELDS.reduce((acc, currentField) => {
  acc[currentField.key] = {
    visible: true,
    required: Boolean(currentField.employerDefaultRequired),
  };
  return acc;
}, {});

export const EMPLOYEE_CANDIDATE_VIEW_CONTROL_DEFAULTS = EMPLOYEE_FIELDS.reduce((acc, currentField) => {
  acc[currentField.key] = {
    visible: currentField.employerDefaultVisible !== false,
  };
  return acc;
}, {});

export const EMPLOYEE_FORM_DEFAULTS = EMPLOYEE_FIELDS.reduce((acc, currentField) => {
  if (currentField.type === "tags" || currentField.type === "repeater") {
    acc[currentField.key] = currentField.defaultValue;
  } else {
    acc[currentField.key] = currentField.defaultValue;
  }
  return acc;
}, {});

export const DEFAULT_PRICING_PRODUCTS = {};
export const DEFAULT_CREDIT_COSTS = {};

export const DEFAULT_PAYMENT_PLANS = [];

export const DEFAULT_SITE_SETTINGS = {
  auth_required: false,
  brand_name: "JobsDirect.ie",
  brand_accent: "Direct",
  hero_eyebrow: "Ireland's leading job platform",
  hero_title: "Find Your Dream Job or Hire Top Talent",
  hero_highlight: "in Ireland",
  hero_subtitle: "Connect with employers and job seekers across Ireland. Your next opportunity is just a search away.",
  primary_cta: "Search Jobs",
  employer_cta: "Post a Job",
  contact_email: "info@jobsdirect.ie",
  contact_phone: "+353 1 234 5678",
  office_location: "Dublin, Ireland",
  footer_blurb: "Ireland's premier job platform connecting talented professionals with leading employers across the country.",
  employer_approval_required: true,
  job_approval_required: true,
  pricing_products: DEFAULT_PRICING_PRODUCTS,
  credit_costs: DEFAULT_CREDIT_COSTS,
  payment_plans: DEFAULT_PAYMENT_PLANS,
};

const buildFieldMap = (fields) =>
  fields.reduce((acc, currentField) => {
    acc[currentField.key] = currentField;
    return acc;
  }, {});

export const COMPANY_FIELD_MAP = buildFieldMap(COMPANY_FIELDS);
export const JOB_FIELD_MAP = buildFieldMap(JOB_FIELDS);
export const EMPLOYEE_FIELD_MAP = buildFieldMap(EMPLOYEE_FIELDS);

export function mergeSiteSettingsWithDefaults(settings = {}) {
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...settings,
    pricing_products: { ...DEFAULT_PRICING_PRODUCTS, ...(settings?.pricing_products || {}) },
    credit_costs: { ...DEFAULT_CREDIT_COSTS, ...(settings?.credit_costs || {}) },
    payment_plans: Array.isArray(settings?.payment_plans) ? settings.payment_plans : [],
    // Form configs are fixed per spec — hardcoded, not from DB
    employer_company_form_config: EMPLOYER_COMPANY_FORM_CONTROL_DEFAULTS,
    employer_job_form_config: EMPLOYER_JOB_FORM_CONTROL_DEFAULTS,
    employee_profile_form_config: EMPLOYEE_PROFILE_FORM_CONTROL_DEFAULTS,
    employee_candidate_view_config: EMPLOYEE_CANDIDATE_VIEW_CONTROL_DEFAULTS,
  };
}

export function buildEntityFormValues(defaultValues, fields, record = {}) {
  return fields.reduce((acc, currentField) => {
    const sourceValue = record?.[currentField.key];
    if (sourceValue === undefined || sourceValue === null) {
      acc[currentField.key] = defaultValues[currentField.key];
      return acc;
    }

    if (currentField.type === "boolean") {
      acc[currentField.key] = Boolean(sourceValue);
      return acc;
    }

    acc[currentField.key] = sourceValue;
    return acc;
  }, { ...defaultValues });
}

export function hasFieldValue(field, value) {
  if (field?.type === "boolean") {
    return typeof value === "boolean";
  }

  if (field?.type === "number") {
    return value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value));
  }

  return String(value ?? "").trim().length > 0;
}
