-- Check if the expiration table exists
CREATE TABLE IF NOT EXISTS public.expiration (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  npc DATE,
  nbi DATE,
  medical DATE,
  orientation DATE,
  license_expiration DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.expiration ENABLE ROW LEVEL SECURITY;

-- Allow personnel and admins to view all expirations
CREATE POLICY IF NOT EXISTS "Personnel and admins can view all expirations" 
  ON public.expiration FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

-- Allow personnel and admins to update expirations
CREATE POLICY IF NOT EXISTS "Personnel and admins can update expirations" 
  ON public.expiration FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

-- Allow personnel and admins to insert expirations
CREATE POLICY IF NOT EXISTS "Personnel and admins can insert expirations" 
  ON public.expiration FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );
