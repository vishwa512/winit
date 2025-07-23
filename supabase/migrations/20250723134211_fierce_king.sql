/*
  # Complete Database Schema for Retail Audit CRM

  1. New Tables
    - `users` - User profiles and authentication
    - `templates` - Audit templates with sections and questions
    - `audits` - Audit execution records
    - `audit_assignments` - Audit assignments to users

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for role-based access
    - Create triggers for updated_at timestamps

  3. Functions
    - Auto-create user profile on signup
    - Update timestamp trigger function
*/

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'auditor' CHECK (role IN ('admin', 'supervisor', 'auditor')),
  assigned_regions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  sections jsonb DEFAULT '[]'::jsonb,
  logic_rules jsonb DEFAULT '[]'::jsonb,
  scoring_rules jsonb DEFAULT '{"weights": {}, "isEnabled": false, "threshold": 80, "criticalQuestions": []}'::jsonb,
  version integer DEFAULT 1,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT false
);

-- Create audits table
CREATE TABLE IF NOT EXISTS audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES templates(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  assigned_to uuid REFERENCES users(id) ON DELETE CASCADE,
  assigned_to_name text NOT NULL,
  location jsonb DEFAULT '{}'::jsonb,
  responses jsonb DEFAULT '{}'::jsonb,
  score numeric,
  compliance_status text CHECK (compliance_status IN ('compliant', 'non_compliant', 'pending')),
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_assignments table
CREATE TABLE IF NOT EXISTS audit_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES templates(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES users(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES users(id) ON DELETE CASCADE,
  location jsonb DEFAULT '{}'::jsonb,
  due_date timestamptz,
  status text DEFAULT 'assigned' CHECK (status IN ('assigned', 'started', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_assignments ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_published ON templates(is_published);
CREATE INDEX IF NOT EXISTS idx_audits_template_id ON audits(template_id);
CREATE INDEX IF NOT EXISTS idx_audits_assigned_to ON audits(assigned_to);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_assignments_assigned_to ON audit_assignments(assigned_to);

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Users policies
CREATE POLICY "Users can read own data" ON users FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own data" ON users FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins and supervisors can read all users" ON users FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'supervisor')
  )
);

-- Templates policies
CREATE POLICY "Users can read own templates" ON templates FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can read published templates" ON templates FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Admins and supervisors can read all templates" ON templates FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'supervisor')
  )
);
CREATE POLICY "Users can insert their own templates" ON templates FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own templates" ON templates FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Admins can update any template" ON templates FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
CREATE POLICY "Users can delete own templates" ON templates FOR DELETE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Admins can delete any template" ON templates FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Audits policies
CREATE POLICY "Users can read assigned audits" ON audits FOR SELECT TO authenticated USING (assigned_to = auth.uid());
CREATE POLICY "Admins and supervisors can read all audits" ON audits FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'supervisor')
  )
);
CREATE POLICY "Admins and supervisors can create audits" ON audits FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'supervisor')
  )
);
CREATE POLICY "Users can update assigned audits" ON audits FOR UPDATE TO authenticated USING (assigned_to = auth.uid());
CREATE POLICY "Admins and supervisors can update any audit" ON audits FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'supervisor')
  )
);

-- Audit assignments policies
CREATE POLICY "Users can read own assignments" ON audit_assignments FOR SELECT TO authenticated USING (assigned_to = auth.uid());
CREATE POLICY "Admins and supervisors can read all assignments" ON audit_assignments FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'supervisor')
  )
);
CREATE POLICY "Admins and supervisors can create assignments" ON audit_assignments FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'supervisor')
  )
);
CREATE POLICY "Admins and supervisors can update assignments" ON audit_assignments FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'supervisor')
  )
);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'auditor'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();