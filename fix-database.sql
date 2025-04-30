-- Check if the expiration table exists, if not create it
CREATE TABLE IF NOT EXISTS public.expiration (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "FULL NAME" TEXT NOT NULL,
  "NPC" DATE,
  "NBI" DATE,
  "MEDICAL" DATE,
  "ORIENTATION" DATE,
  "License Expiration" DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.expiration ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Personnel and admins can view all expirations" ON public.expiration;
DROP POLICY IF EXISTS "Personnel and admins can update expirations" ON public.expiration;
DROP POLICY IF EXISTS "Personnel and admins can insert expirations" ON public.expiration;

-- Create new policies
CREATE POLICY "Personnel and admins can view all expirations" 
  ON public.expiration FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

CREATE POLICY "Personnel and admins can update expirations" 
  ON public.expiration FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

CREATE POLICY "Personnel and admins can insert expirations" 
  ON public.expiration FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

-- Fix documents table RLS policies
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;

-- Create new policy that allows personnel and admins to insert documents for any employee
CREATE POLICY "Personnel and admins can insert documents" 
  ON documents FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );
