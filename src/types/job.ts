export type JobStatus = "draft" | "pending_review" | "approved" | "rejected";

export interface Job {
  id: string;
  employerId?: string;
  title: string;
  shortDescription?: string;
  description?: string;
  location?: string;
  locationFull?: string;
  cityTown?: string;
  country: string;
  jobType?: string;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: string;
  salaryType?: string;
  benefits?: string;
  companyName?: string;
  status: JobStatus;
  isFeatured: boolean;
  source: string;
  sourceUrl?: string;
  applicationEmail?: string;
  applicationMethod?: string;
  applicationUrl?: string;
  hoursPerWeek?: number;
  positionsCount?: number;
  careerLevel?: string;
  createdBy?: string;
  expiresAt?: string;
  listingType: string;
  listingDuration: number;
  creditsCharged: number;
  isDuplicate: boolean;
  duplicateOf?: string;
  isImported: boolean;
  createdAt: string;
  updatedAt: string;
  employer?: import("./employer").Employer;
}

export interface JobCreatePayload {
  title: string;
  description?: string;
  shortDescription?: string;
  location?: string;
  jobType?: string;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: string;
  benefits?: string;
  applicationMethod?: string;
  applicationEmail?: string;
  applicationUrl?: string;
  isFeatured?: boolean;
  [key: string]: any;
}

export interface JobUpdatePayload extends Partial<JobCreatePayload> {
  status?: JobStatus;
}

export interface JobFilters {
  status?: string;
  keyword?: string;
  location?: string;
  jobType?: string;
  category?: string;
  employerId?: string;
  page?: number;
  pageSize?: number;
  order?: string;
  limit?: number;
}

export interface JobCostEstimate {
  totalCredits: number;
  totalAmount: number;
  breakdown: Record<string, number>;
  canPostFree: boolean;
}
