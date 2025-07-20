/*
  # Create templates table for Retail Audit CRM

  1. New Tables
    - `templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `sections` (jsonb) - stores sections and questions
      - `scoring_rules` (jsonb) - scoring configuration
      - `created_by` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_published` (boolean)

  2. Security
    - Enable RLS on `templates` table
    - Add policies for CRUD operations based on user roles
*/

CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  sections jsonb DEFAULT '[]'::jsonb,
  scoring_rules jsonb DEFAULT '{
    "isEnabled": false,
    "weights": {},
    "threshold": 80,
    "criticalQuestions": []
  }'::jsonb,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT false
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Users can read all published templates
CREATE POLICY "Users can read published templates"
  ON templates
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Users can read their own templates (published or draft)
CREATE POLICY "Users can read own templates"
  ON templates
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Admins and supervisors can read all templates
CREATE POLICY "Admins and supervisors can read all templates"
  ON templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- Users can create templates
CREATE POLICY "Authenticated users can create templates"
  ON templates
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON templates
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Admins can update any template
CREATE POLICY "Admins can update any template"
  ON templates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON templates
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Admins can delete any template
CREATE POLICY "Admins can delete any template"
  ON templates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for templates table
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();