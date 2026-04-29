import type { Job } from "./job";
import type { User } from "./auth";

export type ApplicationStatus = "pending" | "reviewed" | "shortlisted" | "rejected";

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  employerId?: string;
  status: ApplicationStatus;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  user?: User;
}

export interface ApplicationCreatePayload {
  jobId: string;
  coverLetter?: string;
}

export interface ApplicationUpdatePayload {
  status?: ApplicationStatus;
}
