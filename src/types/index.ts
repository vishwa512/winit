export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: Section[];
  scoringRules: ScoringRules;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  validationRules: ValidationRules;
  isMandatory: boolean;
  weight?: number;
}

export type QuestionType =
  | 'text'
  | 'numeric'
  | 'single_choice'
  | 'multiple_choice'
  | 'dropdown'
  | 'date'
  | 'file_upload'
  | 'barcode';

export interface ValidationRules {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface ScoringRules {
  isEnabled: boolean;
  weights: Record<string, number>;
  threshold: number;
  criticalQuestions: string[];
}

export interface Audit {
  id: string;
  templateId: string;
  templateName: string;
  status: AuditStatus;
  assignedTo: string;
  assignedToName: string;
  location: Location;
  responses: Record<string, any>;
  score?: number;
  submittedAt?: Date;
  createdAt: Date;
}

export type AuditStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface Location {
  storeName: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedRegions: string[];
  lastLogin?: Date;
  createdAt: Date;
}

export type UserRole = 'admin' | 'supervisor' | 'auditor';

export interface DashboardMetrics {
  totalAudits: number;
  completedAudits: number;
  pendingAudits: number;
  overdueAudits: number;
  averageScore: number;
  complianceRate: number;
}