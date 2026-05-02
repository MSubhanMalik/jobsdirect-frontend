export type JobStatus = "draft" | "pending_review" | "approved" | "rejected";

export interface Job {
  id: string;
  employer_id?: string;
  title: string;
  short_description?: string;
  description?: string;
  location?: string;
  location_full?: string;
  city_town?: string;
  country: string;
  job_type?: string;
  category?: string;
  salary_min?: number;
  salary_max?: number;
  salary_period?: string;
  salary_type?: string;
  benefits?: string;
  company_name?: string;
  status: JobStatus;
  is_featured: boolean;
  source: string;
  source_url?: string;
  application_email?: string;
  application_method?: string;
  application_url?: string;
  hours_per_week?: number;
  positions_count?: number;
  career_level?: string;
  created_by?: string;
  expires_at?: string;
  listing_type: string;
  listing_duration: number;
  credits_charged: number;
  is_duplicate: boolean;
  duplicate_of?: string;
  is_imported: boolean;
  created_at: string;
  updated_at: string;
  employer?: import("./employer").Employer;
}

export interface JobCreatePayload {
  title: string;
  description?: string;
  short_description?: string;
  location?: string;
  job_type?: string;
  category?: string;
  salary_min?: number;
  salary_max?: number;
  salary_period?: string;
  benefits?: string;
  application_method?: string;
  application_email?: string;
  application_url?: string;
  is_featured?: boolean;
  [key: string]: any;
}

export interface JobUpdatePayload extends Partial<JobCreatePayload> {
  status?: JobStatus;
}

export interface JobFilters {
  status?: string;
  keyword?: string;
  location?: string;
  job_type?: string;
  category?: string;
  employer_id?: string;
  page?: number;
  page_size?: number;
  order?: string;
  limit?: number;
}

export interface JobCostEstimate {
  total_credits: number;
  total_amount: number;
  breakdown: Record<string, number>;
  can_post_free: boolean;
}
