-- Create custom types
CREATE TYPE user_role AS ENUM ('patient', 'nakes');
CREATE TYPE appointment_status AS ENUM ('menunggu', 'selesai', 'dibatalkan');

-- PROFILES TABLE
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL,
  nik TEXT UNIQUE,
  address TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('Laki-laki', 'Perempuan')),
  age INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper Function to resolve infinite recursion on profile checks
CREATE OR REPLACE FUNCTION is_nakes()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'nakes'
  );
$$;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow nakes to read all profiles (Fixed infinite recursion)
CREATE POLICY "Nakes can view all profiles" 
ON profiles FOR SELECT 
USING (is_nakes());

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- POLYCLINICS TABLE
CREATE TABLE polyclinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE polyclinics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Polyclinics are viewable by everyone" ON polyclinics FOR SELECT USING (true);
CREATE POLICY "Only nakes can modify polyclinics" ON polyclinics FOR ALL USING (is_nakes());

-- DOCTORS TABLE
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  polyclinic_id UUID REFERENCES polyclinics(id) ON DELETE CASCADE NOT NULL,
  specialization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors are viewable by everyone" ON doctors FOR SELECT USING (true);
CREATE POLICY "Only nakes can modify doctors" ON doctors FOR ALL USING (is_nakes());

-- APPOINTMENTS TABLE
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  polyclinic_id UUID REFERENCES polyclinics(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  queue_number INTEGER NOT NULL,
  status appointment_status NOT NULL DEFAULT 'menunggu',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments" ON appointments FOR SELECT USING (auth.uid() = patient_id);

-- Patients can insert their own appointments
CREATE POLICY "Patients can book appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Nakes can view all appointments
CREATE POLICY "Nakes can view all appointments" ON appointments FOR SELECT USING (is_nakes());

-- Nakes can update appointment status
CREATE POLICY "Nakes can update appointments" ON appointments FOR UPDATE USING (is_nakes());

-- MEDICAL RECORDS TABLE
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  diagnosis TEXT NOT NULL,
  actions TEXT,
  medicine TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own records" ON medical_records FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Nakes can view all records" ON medical_records FOR SELECT USING (is_nakes());
CREATE POLICY "Nakes can insert records" ON medical_records FOR INSERT WITH CHECK (is_nakes());

-- Auto update 'updated_at' Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if they exist so we can safely re-run
DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
DROP TRIGGER IF EXISTS update_appointments_modtime ON appointments;
DROP TRIGGER IF EXISTS update_medical_records_modtime ON medical_records;
DROP TRIGGER IF EXISTS set_queue_number ON appointments;

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_appointments_modtime BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_medical_records_modtime BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to auto generate queue number
CREATE OR REPLACE FUNCTION generate_queue_number() RETURNS TRIGGER AS $$
DECLARE
  next_queue INTEGER;
BEGIN
  SELECT COALESCE(MAX(queue_number), 0) + 1 INTO next_queue
  FROM appointments
  WHERE polyclinic_id = NEW.polyclinic_id AND appointment_date = NEW.appointment_date;
  
  NEW.queue_number := next_queue;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_queue_number
BEFORE INSERT ON appointments
FOR EACH ROW
WHEN (NEW.queue_number IS NULL)
EXECUTE PROCEDURE generate_queue_number();
