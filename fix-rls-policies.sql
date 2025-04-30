-- Fix documents table RLS policies
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Personnel and admins can view all documents" ON documents;

-- Create new policies
CREATE POLICY "Personnel and admins can view all documents" 
  ON documents FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

CREATE POLICY "Personnel and admins can insert documents" 
  ON documents FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

CREATE POLICY "Personnel and admins can update documents" 
  ON documents FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

CREATE POLICY "Personnel and admins can delete documents" 
  ON documents FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );
