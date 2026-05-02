import type { Job } from "./job";
import type { User } from "./auth";

export type ApplicationStatus = "pending" | "reviewed" | "shortlisted" | "rejected";

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  employer_id?: string;
  status: ApplicationStatus;
  cover_letter?: string;
  created_at: string;
  updated_at: string;
  job?: Job;
  user?: User;
}

export interface ApplicationCreatePayload {
  job_id: string;
  cover_letter?: string;
}

export interface ApplicationUpdatePayload {
  status?: ApplicationStatus;
}
