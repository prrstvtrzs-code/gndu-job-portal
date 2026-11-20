export enum JobType {
  FullTime = 'Full-Time',
  Internship = 'Internship',
  OnCampusDrive = 'On-Campus Drive',
}

export enum WorkMode {
  OnSite = 'On-Site',
  Hybrid = 'Hybrid',
  Remote = 'Remote',
}

export enum Department {
  CSE_IT = 'B.Tech CSE / IT',
  MCA = 'MCA',
  ECE = 'B.Tech ECE',
  MBA = 'MBA / Commerce',
  PHARMACY = 'B.Pharm / Biotech',
  ARCH_CIVIL = 'B.Arch / Civil',
}

export enum ApplicationStatus {
  UnderReview = 'Under Review',
  Shortlisted = 'Shortlisted',
  InterviewScheduled = 'Interview Scheduled',
  Selected = 'Selected',
  NotSelected = 'Not Selected',
}

export enum UserRole {
  Student = 'Student',
  Recruiter = 'Placement Cell / Recruiter',
}

export type ActiveTab = 'home' | 'jobs' | 'companies' | 'drives' | 'workspace';
export type WorkspaceSubTab = 'applications' | 'resume' | 'recruiter';

export interface AuthAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  rollNumber?: string;
  department?: Department;
  organization?: string;
  cgpa?: number;
}

export interface JobOpening {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  industry: string;
  location: string;
  workMode: WorkMode;
  jobType: JobType;
  compensationLabel: string;
  packageLpaNumeric: number;
  minCgpa: number;
  maxBacklogs: number;
  eligibleDepartments: Department[];
  deadline: string;
  postedDate: string;
  summary: string;
  responsibilities: string[];
  skills: string[];
  selectionProcess: string[];
  campusVenue?: string;
  driveDate?: string;
  pptTime?: string;
  isOpen: boolean;
}

export interface StudentProfile {
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  department: Department;
  semester: number;
  graduationYear: number;
  cgpa: number;
  activeBacklogs: number;
  resumeUrl: string;
  portfolioUrl: string;
  skills: string[];
  bio: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  studentName: string;
  studentRollNumber: string;
  studentEmail: string;
  studentDepartment: Department;
  studentCgpa: number;
  resumeUrl: string;
  coverNote: string;
  appliedDate: string;
  status: ApplicationStatus;
  isCurrentStudent: boolean;
}

export interface CampusNotice {
  id: string;
  date: string;
  category: string;
  title: string;
  summary: string;
}

export interface PrepChecklistItem {
  id: string;
  label: string;
  detail: string;
}
