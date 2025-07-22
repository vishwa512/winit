/*
  # Fix Database Schema for Retail Audit CRM

  1. New Tables
    - `profiles` - User profiles linked to auth.users
    - `templates` - Audit templates with proper structure
    - `audits` - Audit instances
    - `audit_assignments` - Audit assignments

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper foreign key relationships

  3. Functions
    - Auto-create profile on user signup
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'auditor' CHECK (role IN ('admin', 'supervisor', 'auditor')),
  assigned_regions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  sections jsonb DEFAULT '[]'::jsonb,
  logic_rules jsonb DEFAULT '[]'::jsonb,
  scoring_rules jsonb DEFAULT '{"isEnabled": false, "weights": {}, "threshold": 80, "criticalQuestions": []}'::jsonb,
  version integer DEFAULT 1,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
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
  assigned_to uuid REFERENCES profiles(id) ON DELETE CASCADE,
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
  assigned_to uuid REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  location jsonb DEFAULT '{}'::jsonb,
  due_date timestamptz,
  status text DEFAULT 'assigned' CHECK (status IN ('assigned', 'started', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_assignments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Templates policies
CREATE POLICY "Users can read own templates" ON templates
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can read published templates" ON templates
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can create templates" ON templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own templates" ON templates
  FOR DELETE USING (created_by = auth.uid());

-- Admins and supervisors can read all templates
CREATE POLICY "Admins and supervisors can read all templates" ON templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- Audits policies
CREATE POLICY "Users can read assigned audits" ON audits
  FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Users can update assigned audits" ON audits
  FOR UPDATE USING (assigned_to = auth.uid());

CREATE POLICY "Admins and supervisors can read all audits" ON audits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Admins and supervisors can create audits" ON audits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- Audit assignments policies
CREATE POLICY "Users can read own assignments" ON audit_assignments
  FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Admins and supervisors can read all assignments" ON audit_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Admins and supervisors can create assignments" ON audit_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_published ON templates(is_published);
CREATE INDEX IF NOT EXISTS idx_audits_assigned_to ON audits(assigned_to);
CREATE INDEX IF NOT EXISTS idx_audits_template_id ON audits(template_id);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);