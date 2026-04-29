export type VerificationStatus = "draft" | "pending" | "submitted" | "approved" | "rejected";

export interface Employer {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  companyName: string;
  website?: string;
  croNumber?: string;
  employerNumber?: string;
  phone?: string;
  verificationStatus: VerificationStatus;
  approvalSubmittedAt?: string;
  approvedAt?: string;
  adminReviewNote?: string;
  credits: number;
  candidateDatabaseAccess: boolean;
  candidateDatabaseStatus?: string;
  candidateDatabaseSubscriptionId?: string;
  candidateDatabaseStartedAt?: string;
  candidateDatabaseCancelledAt?: string;
  stripeCustomerId?: string;
  profileData?: Record<string, any>;
  profileCompleted: boolean;
  lastFreeJobAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployerCreatePayload {
  companyName: string;
  [key: string]: any;
}

export interface EmployerUpdatePayload {
  [key: string]: any;
}
