import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error('Missing Supabase environment variables. Please check your .env file and restart the development server.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'supervisor' | 'auditor';
          assigned_regions: string[];
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'admin' | 'supervisor' | 'auditor';
          assigned_regions?: string[];
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'supervisor' | 'auditor';
          assigned_regions?: string[];
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          sections: any[];
          logic_rules: any[];
          scoring_rules: any;
          version: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          is_published: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          category: string;
          sections?: any[];
          logic_rules?: any[];
          scoring_rules?: any;
          version?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          is_published?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          sections?: any[];
          logic_rules?: any[];
          scoring_rules?: any;
          version?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          is_published?: boolean;
        };
      };
      audits: {
        Row: {
          id: string;
          template_id: string;
          template_name: string;
          status: 'pending' | 'in_progress' | 'completed' | 'overdue';
          assigned_to: string;
          assigned_to_name: string;
          location: any;
          responses: any;
          score: number | null;
          compliance_status: 'compliant' | 'non_compliant' | 'pending' | null;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          template_name: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
          assigned_to: string;
          assigned_to_name: string;
          location?: any;
          responses?: any;
          score?: number | null;
          compliance_status?: 'compliant' | 'non_compliant' | 'pending' | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          template_name?: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'overdue';
          assigned_to?: string;
          assigned_to_name?: string;
          location?: any;
          responses?: any;
          score?: number | null;
          compliance_status?: 'compliant' | 'non_compliant' | 'pending' | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}