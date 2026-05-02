export type VerificationStatus = "draft" | "pending" | "submitted" | "approved" | "rejected";

export interface Employer {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  company_name: string;
  website?: string;
  cro_number?: string;
  employer_number?: string;
  phone?: string;
  verification_status: VerificationStatus;
  approval_submitted_at?: string;
  approved_at?: string;
  admin_review_note?: string;
  credits: number;
  candidate_database_access: boolean;
  candidate_database_status?: string;
  candidate_database_subscription_id?: string;
  candidate_database_started_at?: string;
  candidate_database_cancelled_at?: string;
  stripe_customer_id?: string;
  profile_data?: Record<string, any>;
  profile_completed: boolean;
  last_free_job_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployerCreatePayload {
  company_name: string;
  [key: string]: any;
}

export interface EmployerUpdatePayload {
  [key: string]: any;
}
