/*
  # Create audits table for Retail Audit CRM

  1. New Tables
    - `audits`
      - `id` (uuid, primary key)
      - `template_id` (uuid, foreign key to templates)
      - `template_name` (text) - denormalized for performance
      - `status` (text) - pending, in_progress, completed, overdue
      - `assigned_to` (uuid, foreign key to users)
      - `assigned_to_name` (text) - denormalized for performance
      - `location` (jsonb) - store details and coordinates
      - `responses` (jsonb) - audit responses
      - `score` (numeric) - calculated score
      - `submitted_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `audits` table
    - Add policies for CRUD operations
*/

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
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Users can read audits assigned to them
CREATE POLICY "Users can read assigned audits"
  ON audits
  FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

-- Admins and supervisors can read all audits
CREATE POLICY "Admins and supervisors can read all audits"
  ON audits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- Admins and supervisors can create audits
CREATE POLICY "Admins and supervisors can create audits"
  ON audits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- Users can update audits assigned to them
CREATE POLICY "Users can update assigned audits"
  ON audits
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid());

-- Admins and supervisors can update any audit
CREATE POLICY "Admins and supervisors can update any audit"
  ON audits
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- Create trigger for audits table
CREATE TRIGGER update_audits_updated_at
  BEFORE UPDATE ON audits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audits_assigned_to ON audits(assigned_to);
CREATE INDEX IF NOT EXISTS idx_audits_template_id ON audits(template_id);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at);