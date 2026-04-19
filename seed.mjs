import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mfdsykwvwbhtrrcbhfzg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZHN5a3d2d2JodHJyY2JoZnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzgzNjQsImV4cCI6MjA5MTY1NDM2NH0.dmTQFl0ggDIeZjj9DBktZGb-9iCLQtMqp2xgmavEYrM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Memulai pembuatan akun Nakes dan Poli...');
  
  const email = 'nakes1@klinik.com';
  const password = 'password123';

  // 1. Sign up new auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes('User already registered')) {
        console.log('User already exists, trying to sign in instead to run the rest of the script...');
        await supabase.auth.signInWithPassword({ email, password });
    } else {
        return console.error('Gagal Sign Up Auth:', authError.message);
    }
  }

  // Get current session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return console.error('Tidak ada user auth aktif.');

  // 2. Insert Profile as Patient first (RLS allows inserting self)
  console.log('Menyiapkan Profile Nakes...');
  const { error: insertProfileErr } = await supabase.from('profiles').upsert([{
    id: user.id,
    role: 'nakes', // Insert self as nakes directly
    full_name: 'Dr. Budi Santoso',
    gender: 'Laki-laki',
    age: 40
  }]);

  if (insertProfileErr) return console.error('Gagal Insert Profile:', insertProfileErr.message);

  // 3. Create Polyclinic
  console.log('Membuat Poliklinik Umum...');
  const { data: poliData, error: poliErr } = await supabase.from('polyclinics').insert([{
    name: 'Poli Umum',
    description: 'Pelayanan kesehatan umum dan rujukan tertutup.'
  }]).select().single();

  if (poliErr) return console.error('Gagal membuat Poli:', poliErr.message);

  // 4. Create Doctor mapping
  console.log('Menyambungkan Nakes ke Poli...');
  const { error: doctorErr } = await supabase.from('doctors').insert([{
    profile_id: user.id,
    polyclinic_id: poliData.id,
    specialization: 'Dokter Umum'
  }]);

  if (doctorErr) return console.error('Gagal membuat Dokter:', doctorErr.message);

  console.log('==============================================');
  console.log('SELESAI! Data Nakes berhasil di-generate:');
  console.log('Email Nakes  :', email);
  console.log('Password     :', password);
  console.log('Poliklinik   : Poli Umum');
  console.log('==============================================');
}

seed();
