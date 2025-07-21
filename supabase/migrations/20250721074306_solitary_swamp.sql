/*
  # Complete Retail Audit CRM Database Schema

  1. Enhanced Tables
    - `users` - User management with roles and regions
    - `templates` - Audit templates with sections, questions, and logic
    - `audits` - Audit instances with responses and scoring
    - `audit_assignments` - Audit assignments to users

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for role-based access

  3. Features
    - Template versioning
    - Conditional logic support
    - Scoring and compliance tracking
    - Audit workflow management
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS audit_assignments CASCADE;
DROP TABLE IF EXISTS audits CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
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

-- Create audit assignments table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_published ON templates(is_published);
CREATE INDEX IF NOT EXISTS idx_audits_template_id ON audits(template_id);
CREATE INDEX IF NOT EXISTS idx_audits_assigned_to ON audits(assigned_to);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_assignments_assigned_to ON audit_assignments(assigned_to);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_assignments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can read all users" ON users FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
CREATE POLICY "Admins can insert users" ON users FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
CREATE POLICY "Admins can update users" ON users FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Templates policies
CREATE POLICY "Users can read own templates" ON templates FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can read published templates" ON templates FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Admins and supervisors can read all templates" ON templates FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'supervisor')
  )
);
CREATE POLICY "Authenticated users can create templates" ON templates FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own templates" ON templates FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Admins can update any template" ON templates FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
CREATE POLICY "Users can delete own templates" ON templates FOR DELETE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Admins can delete any template" ON templates FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Audits policies
CREATE POLICY "Users can read assigned audits" ON audits FOR SELECT TO authenticated USING (assigned_to = auth.uid());
CREATE POLICY "Admins and supervisors can read all audits" ON audits FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'supervisor')
  )
);
CREATE POLICY "Admins and supervisors can create audits" ON audits FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'supervisor')
  )
);
CREATE POLICY "Users can update assigned audits" ON audits FOR UPDATE TO authenticated USING (assigned_to = auth.uid());
CREATE POLICY "Admins and supervisors can update any audit" ON audits FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'supervisor')
  )
);

-- Audit assignments policies
CREATE POLICY "Users can read own assignments" ON audit_assignments FOR SELECT TO authenticated USING (assigned_to = auth.uid());
CREATE POLICY "Admins and supervisors can read all assignments" ON audit_assignments FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'supervisor')
  )
);
CREATE POLICY "Admins and supervisors can create assignments" ON audit_assignments FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'supervisor')
  )
);
CREATE POLICY "Admins and supervisors can update assignments" ON audit_assignments FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role IN ('admin', 'supervisor')
  )
);

-- Insert sample data
INSERT INTO users (id, email, name, role, assigned_regions) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'admin@retailaudit.com', 'Admin User', 'admin', '["All Regions"]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440001', 'supervisor@retailaudit.com', 'Supervisor User', 'supervisor', '["North", "South"]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440002', 'auditor@retailaudit.com', 'Auditor User', 'auditor', '["Downtown", "Uptown"]'::jsonb)
ON CONFLICT (email) DO NOTHING;