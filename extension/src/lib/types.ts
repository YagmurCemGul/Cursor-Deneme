export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship" | "Temporary" | "Freelance" | "Volunteer" | "Other";

export interface ResumeProfile {
  id: string;
  profileName: string;
  personal: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    linkedin?: string; // only username stored, full computed
    portfolio?: string;
    github?: string; // only username stored
    whatsapp?: string; // full link
    phone?: string;
    phoneCountryCode?: string;
    location?: string;
    summary?: string;
  };
  skills: string[];
  experience: Array<{
    title: string;
    employmentType?: EmploymentType;
    company: string;
    startDate: string; // ISO
    endDate?: string; // ISO or undefined if current
    isCurrent?: boolean;
    location?: string;
    locationType?: "On-site" | "Hybrid" | "Remote";
    description?: string;
    skills?: string[];
  }>;
  education: Array<{
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    expected?: boolean;
    grade?: string;
    activities?: string;
    description?: string;
    skills?: string[];
  }>;
  licenses: Array<{
    name: string;
    organization?: string;
    issueDate?: string;
    expirationDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    skills?: string[];
  }>;
  projects: Array<{
    name: string;
    description?: string;
    skills?: string[];
    startDate?: string;
    endDate?: string;
    current?: boolean;
    associatedWith?: string[]; // companies, orgs, education
  }>;
  extraQuestions: Array<CustomQuestion>;
  templates: Array<TemplateMeta>;
}

export interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "checkbox" | "checkbox-group" | "radio-group" | "select" | "fieldset";
  options?: Array<{ label: string; value: string }>;
  value?: unknown;
}

export interface TemplateMeta {
  id: string;
  name: string;
  kind: "resume" | "cover-letter";
  fileId?: string; // for Google Drive in future
}

export interface JobPost {
  id: string;
  title?: string;
  company?: string;
  pastedText: string;
  url?: string;
}

export interface AtsOptimization {
  id: string;
  kind: "addition" | "rewrite" | "reorder" | "remove";
  section: string;
  before?: string;
  after?: string;
  rationale: string;
}

export type ApplicationStatus = 
  | "wishlist"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  location?: string;
  salary?: string;
  jobType?: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  jobDescription?: string;
  jobUrl?: string;
  applicationDate?: string; // ISO date
  deadline?: string; // ISO date
  status: ApplicationStatus;
  priority?: "low" | "medium" | "high";
  notes?: string;
  contacts?: Array<{
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
  }>;
  timeline?: Array<{
    id: string;
    date: string; // ISO
    status: ApplicationStatus;
    note?: string;
    type?: "status_change" | "interview" | "note" | "reminder";
  }>;
  interviews?: Array<{
    id: string;
    date: string; // ISO
    time?: string;
    type?: "Phone" | "Video" | "On-site" | "Technical" | "HR" | "Final";
    interviewer?: string;
    notes?: string;
    completed?: boolean;
  }>;
  documents?: Array<{
    id: string;
    name: string;
    type: "resume" | "cover_letter" | "portfolio" | "other";
    url?: string;
  }>;
  reminders?: Array<{
    id: string;
    date: string; // ISO
    message: string;
    completed?: boolean;
  }>;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
