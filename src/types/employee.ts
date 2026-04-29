export interface WorkExperience {
  jobTitle: string;
  company: string;
  duration: string;
  responsibilities: string;
}

export interface Education {
  degree: string;
  institution: string;
  duration: string;
  description: string;
}

export interface Employee {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  phone?: string;
  address?: string;
  location?: string;
  bio?: string;
  profileCompleted: boolean;
  skills?: string;
  experienceYears?: number;
  dateOfBirth?: string;
  desiredJobType?: string;
  desiredLocation?: string;
  availability?: string;
  isSearchable: boolean;
  workExperience?: WorkExperience[];
  education?: Education[];
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCreatePayload {
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

export interface EmployeeUpdatePayload {
  [key: string]: any;
}
