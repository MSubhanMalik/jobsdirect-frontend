export interface PricingProducts {
  JOB_LISTING: string;
  DUPLICATE_JOB: string;
  IMPORT_JOB: string;
  ADDON_HIGHLIGHT: string;
}

export interface FieldControlConfig {
  [key: string]: {
    visible: boolean;
    required: boolean;
  };
}

export interface SiteSettings {
  auth_required: boolean;
  brand_name: string;
  brand_accent: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_highlight: string;
  hero_subtitle: string;
  primary_cta: string;
  employer_cta: string;
  contact_email: string;
  contact_phone: string;
  office_location: string;
  footer_blurb: string;
  employer_approval_required: boolean;
  job_approval_required: boolean;
  pricing_products: PricingProducts;
  payment_plans: any[];
  employer_company_form_config: FieldControlConfig;
  employer_job_form_config: FieldControlConfig;
  [key: string]: any;
}

export interface PageContent {
  id: string;
  slug: string;
  title?: string;
  content?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
  updatedAt: string;
}
