-- Fix documents table RLS policies
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;

-- Create new policy that allows personnel and admins to insert documents for any employee
CREATE POLICY "Personnel and admins can insert documents" 
  ON documents FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );
  
-- Create new policy that allows personnel and admins to update documents
CREATE POLICY "Personnel and admins can update documents" 
  ON documents FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

-- Create a function to execute SQL for fixing RLS policies
CREATE OR REPLACE FUNCTION execute_sql(sql_string text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_string;
END;
$$;
