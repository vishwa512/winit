export interface Template {
  id?: string;
  name: string;
  description: string;
  category: string;
  sections: Section[];
  logic_rules: LogicRule[];
  scoring_rules: ScoringRules;
  version?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  is_published: boolean;
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
  validation_rules: ValidationRules;
  is_mandatory: boolean;
  weight?: number;
  section_id?: string;
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
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
  pattern?: string;
  required?: boolean;
}

export interface LogicRule {
  id: string;
  trigger_question_id: string;
  trigger_value: any;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  action: 'show' | 'hide' | 'skip_to_section' | 'require' | 'make_optional';
  target_question_id?: string;
  target_section_id?: string;
  logic_operator?: 'AND' | 'OR' | 'NOT';
}

export interface ScoringRules {
  isEnabled: boolean;
  weights: Record<string, number>;
  threshold: number;
  criticalQuestions: string[];
  section_weights?: Record<string, number>;
}

export interface Audit {
  id?: string;
  template_id: string;
  template_name: string;
  status: AuditStatus;
  assigned_to: string;
  assigned_to_name: string;
  location: Location;
  responses: Record<string, any>;
  score?: number;
  compliance_status?: 'compliant' | 'non_compliant' | 'pending';
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export type AuditStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface Location {
  store_name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  region?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  assigned_regions: string[];
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = 'admin' | 'supervisor' | 'auditor';

export interface AuditAssignment {
  id?: string;
  template_id: string;
  assigned_to: string;
  assigned_by: string;
  location: Location;
  due_date?: string;
  status: 'assigned' | 'started' | 'completed';
  created_at?: string;
}

export interface DashboardMetrics {
  totalAudits: number;
  completedAudits: number;
  pendingAudits: number;
  overdueAudits: number;
  averageScore: number;
  complianceRate: number;
  totalTemplates: number;
  publishedTemplates: number;
}

export interface ReportFilter {
  dateRange: string;
  category?: string;
  region?: string;
  status?: string;
  assignedTo?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeResponses: boolean;
  includeScores: boolean;
  includeImages: boolean;
}