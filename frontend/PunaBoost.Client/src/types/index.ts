// ============================================
// USER AND AUTH TYPES
// ============================================
export interface User {
  email: string;
  role: 'Admin' | 'Candidate' | 'Company' | 'None';
  name?: string; // Full name for display
  firstName?: string; // For candidates
  lastName?: string; // For candidates
  companyName?: string; // For companies
}

export interface AuthResponse {
  email: string;
  token: string;
  role: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CandidateCreateDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  resume: File;
}

export interface CompanyCreateDto {
  companyName: string;
  email: string;
  phoneNumber: string;
  password: string;
  description: string;
  website: string;
  location: string;
  foundedYear: number;
  numberOfEmployees: number;
  countryId?: number;
  cityId?: number;
  logo: File;
}

// ============================================
// CANDIDATE TYPES
// ============================================
export interface CandidateDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  resumeUrl: string;
  skills?: Skill[];
}

export interface CandidateUpdateDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface CandidateSkillsDto {
  skillIds: number[];
}

// ============================================
// RESUME TYPES
// ============================================
export interface ResumeDto {
  id: number;
  fileName: string;
  fileUrl: string;
  name: string;
  candidateId: string;
  createdAt: string;
  isDefault: boolean;
}

export interface ResumeCreateDto {
  name: string;
  isDefault?: boolean;
}

// ============================================
// COMPANY TYPES
// ============================================
export interface CompanyDto {
  id: string;
  companyName: string;
  description: string;
  logoUrl: string;
  website: string;
  location: string;
  foundedYear: number;
  numberOfEmployees: number;
  linkedIn?: string;
  countryId?: number;
  countryName?: string;
  cityId?: number;
  cityName?: string;
}

export interface CompanyUpdateDto {
  companyName?: string;
  description?: string;
  website?: string;
  location?: string;
  foundedYear?: number;
  numberOfEmployees?: number;
  linkedIn?: string;
  countryId?: number;
  cityId?: number;
}

// ============================================
// JOB TYPES
// ============================================
export interface JobDto {
  id: string;
  title: string;
  description: string;
  location: string;
  salaryFrom: number;
  salaryTo?: number;
  isRemote: boolean;
  companyId: string;
  companyName: string;
  companyLogoUrl?: string;
  industryId?: number;
  industryName?: string;
  countryId?: number;
  countryName?: string;
  cityId?: number;
  cityName?: string;
  companyCountryName?: string;
  companyCityName?: string;
  skills: JobSkillDto[];
  applications?: JobApplicationDto[];
  postedAt: string;
  expiresAt?: string;
}

export interface JobCreateDto {
  title: string;
  description: string;
  location: string;
  salaryFrom: number;
  salaryTo?: number;
  isRemote: boolean;
  industryId: number;
  countryId: number;
  cityId: number;
  expiresAt: Date;
  skillIds: number[];
}

export interface JobUpdateDto {
  title?: string;
  description?: string;
  location?: string;
  salaryFrom?: number;
  salaryTo?: number;
  isRemote?: boolean;
  industryId: number;
  countryId: number;
  cityId: number;
  expiresAt: Date;
  skillIds?: number[];
}

export interface JobSkillDto {
  skillId: number;
  skillName: string;
}

// ============================================
// JOB APPLICATION TYPES
// ============================================
export const ApplicationStatus = {
  Pending: 'Pending',
  Reviewed: 'Reviewed',
  Shortlisted: 'Shortlisted',
  Interview: 'Interview',
  Accepted: 'Accepted',
  Rejected: 'Rejected',
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export interface JobApplicationDto {
  id: number;
  jobId: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhoneNumber?: string;
  candidateResumeUrl?: string;
  resumeId?: number;
  resumeName?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string;
  // Full Job Details (included in my-applications response)
  jobTitle?: string;
  jobDescription?: string;
  jobLocation?: string;
  salaryFrom?: number;
  salaryTo?: number;
  isRemote?: boolean;
  companyId?: string;
  companyName?: string;
  companyLogoUrl?: string;
  industryId?: number;
  industryName?: string;
  countryId?: number;
  countryName?: string;
  cityId?: number;
  cityName?: string;
  companyCountryName?: string;
  companyCityName?: string;
  jobPostedAt?: string;
  jobExpiresAt?: string;
}

export interface JobApplicationCreateDto {
  jobId: string;
  resumeId?: number;
  notes?: string;
}

export interface JobApplicationUpdateDto {
  status: ApplicationStatus;
}

// ============================================
// SKILL AND INDUSTRY TYPES
// ============================================
export interface Skill {
  id: number;
  name: string;
}

export interface Industry {
  id: number;
  name: string;
}

// ============================================
// COUNTRY AND CITY TYPES
// ============================================
export interface Country {
  id: number;
  name: string;
  code: string;
}

export interface City {
  id: number;
  name: string;
  countryId: number;
  countryName?: string;
}
