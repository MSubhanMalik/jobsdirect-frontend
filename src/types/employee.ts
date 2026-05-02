export interface WorkExperience {
  job_title: string;
  company: string;
  start_date: string;
  end_date: string;
  current: boolean;
  responsibilities: string;
}

export interface Education {
  degree: string;
  institution: string;
  field_of_study: string;
  year: string;
  description: string;
}

export interface Employee {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  phone?: string;
  address?: string;
  location?: string;
  bio?: string;
  profile_completed: boolean;
  skills?: string[];
  experience_years?: number;
  date_of_birth?: string;
  desired_job_type?: string;
  desired_location?: string;
  availability?: string;
  is_searchable: boolean;
  work_experience?: WorkExperience[];
  education?: Education[];
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreatePayload {
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

export interface EmployeeUpdatePayload {
  [key: string]: any;
}
