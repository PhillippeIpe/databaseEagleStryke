-- Create profiles table for user information
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'personnel', 'security_employee')) NOT NULL DEFAULT 'security_employee',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create announcements table
CREATE TABLE announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create documents table for 201 files
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id UUID REFERENCES profiles(id) NOT NULL,
  document_type TEXT CHECK (document_type IN (
    'security_license',
    'list_of_graduates',
    'opening_duty_report',
    'closing_duty_report',
    'security_training_certificate',
    'firearm_training_certificate',
    'drug_test_results',
    'neurological_exam_results',
    'quit_claim'
  )) NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  expiration_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create document expirations table
CREATE TABLE document_expirations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id UUID REFERENCES profiles(id) NOT NULL,
  security_license_expiry DATE,
  security_training_expiry DATE,
  firearm_training_expiry DATE,
  drug_test_expiry DATE,
  neurological_exam_expiry DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up Row Level Security (RLS) policies

-- Profiles table policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Allow personnel and admins to view all profiles
CREATE POLICY "Personnel and admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

-- Announcements table policies
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view announcements
CREATE POLICY "All users can view announcements" 
  ON announcements FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow personnel and admins to create announcements
CREATE POLICY "Personnel and admins can create announcements" 
  ON announcements FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

-- Allow users to update their own announcements
CREATE POLICY "Users can update own announcements" 
  ON announcements FOR UPDATE 
  USING (created_by = auth.uid());

-- Allow admins to update any announcement
CREATE POLICY "Admins can update any announcement" 
  ON announcements FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Documents table policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own documents
CREATE POLICY "Users can view own documents" 
  ON documents FOR SELECT 
  USING (employee_id = auth.uid());

-- Allow users to insert their own documents
CREATE POLICY "Users can insert own documents" 
  ON documents FOR INSERT 
  WITH CHECK (employee_id = auth.uid());

-- Allow users to update their own documents
CREATE POLICY "Users can update own documents" 
  ON documents FOR UPDATE 
  USING (employee_id = auth.uid());

-- Allow personnel and admins to view all documents
CREATE POLICY "Personnel and admins can view all documents" 
  ON documents FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

-- Document expirations table policies
ALTER TABLE document_expirations ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own expirations
CREATE POLICY "Users can view own expirations" 
  ON document_expirations FOR SELECT 
  USING (employee_id = auth.uid());

-- Allow personnel and admins to view all expirations
CREATE POLICY "Personnel and admins can view all expirations" 
  ON document_expirations FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

-- Allow personnel and admins to update expirations
CREATE POLICY "Personnel and admins can update expirations" 
  ON document_expirations FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

-- Create storage buckets for document files
INSERT INTO storage.buckets (id, name, public) VALUES ('employee_documents', 'employee_documents', false);

-- Set up storage policies
CREATE POLICY "Users can upload their own documents" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'employee_documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own documents" 
  ON storage.objects FOR SELECT 
  USING (
    bucket_id = 'employee_documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Personnel and admins can view all documents" 
  ON storage.objects FOR SELECT 
  USING (
    bucket_id = 'employee_documents' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('personnel', 'admin')
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'security_employee');
  
  INSERT INTO public.document_expirations (employee_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
