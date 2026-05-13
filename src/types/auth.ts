export type UserRole = "employee" | "employer" | "admin";
export type UserStatus = "active" | "suspended";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  google_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
  // Employer-specific (when role = "employer")
  company_name?: string;
  employer_reg_no?: string;
  company_reg_no?: string;
  website?: string;
  // Shared optional
  phone?: string;
  // Employee-specific (when role = "employee")
  country?: string;
  county?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}
