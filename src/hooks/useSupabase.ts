import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/supabase';
import type { Template, Audit, AuditAssignment } from '../types';

type Tables = Database['public']['Tables'];
type TemplateRow = Tables['templates']['Row'];
type TemplateInsert = Tables['templates']['Insert'];
type TemplateUpdate = Tables['templates']['Update'];
type AuditRow = Tables['audits']['Row'];
type AuditInsert = Tables['audits']['Insert'];
type AuditUpdate = Tables['audits']['Update'];
type UserRow = Tables['users']['Row'];

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleError = (err: any) => {
    console.error('Supabase error:', err);
    setError(err instanceof Error ? err.message : 'An error occurred');
  };

  // Template CRUD operations
  const createTemplate = async (template: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<TemplateRow | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const templateData: TemplateInsert = {
        name: template.name,
        description: template.description || '',
        category: template.category,
        sections: template.sections || [],
        logic_rules: template.logic_rules || [],
        scoring_rules: template.scoring_rules || {
          isEnabled: false,
          weights: {},
          threshold: 80,
          criticalQuestions: [],
        },
        created_by: user.id,
        is_published: template.is_published || false,
      };

      const { data, error } = await supabase
        .from('templates')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTemplates = async (): Promise<TemplateRow[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTemplate = async (id: string): Promise<TemplateRow | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id: string, updates: Partial<Template>): Promise<TemplateRow | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updateData: TemplateUpdate = {
        name: updates.name,
        description: updates.description,
        category: updates.category,
        sections: updates.sections,
        logic_rules: updates.logic_rules,
        scoring_rules: updates.scoring_rules,
        is_published: updates.is_published,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const publishTemplate = async (id: string): Promise<boolean> => {
    return updateTemplate(id, { is_published: true }).then(result => !!result);
  };

  // Audit CRUD operations
  const createAudit = async (audit: Omit<Audit, 'id' | 'created_at' | 'updated_at'>): Promise<AuditRow | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const auditData: AuditInsert = {
        template_id: audit.template_id,
        template_name: audit.template_name,
        status: audit.status || 'pending',
        assigned_to: audit.assigned_to,
        assigned_to_name: audit.assigned_to_name,
        location: audit.location || {},
        responses: audit.responses || {},
        score: audit.score,
        compliance_status: audit.compliance_status,
      };

      const { data, error } = await supabase
        .from('audits')
        .insert(auditData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAudits = async (): Promise<AuditRow[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getAudit = async (id: string): Promise<AuditRow | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAudit = async (id: string, updates: Partial<Audit>): Promise<AuditRow | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updateData: AuditUpdate = {
        status: updates.status,
        responses: updates.responses,
        score: updates.score,
        compliance_status: updates.compliance_status,
        submitted_at: updates.submitted_at,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('audits')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAudit = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('audits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // User operations
  const getUsers = async (): Promise<UserRow[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    // Template operations
    createTemplate,
    getTemplates,
    getTemplate,
    updateTemplate,
    deleteTemplate,
    publishTemplate,
    // Audit operations
    createAudit,
    getAudits,
    getAudit,
    updateAudit,
    deleteAudit,
    // User operations
    getUsers,
  };
};