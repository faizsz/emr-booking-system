import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', nik: '',
    address: '', birthDate: '', gender: 'Laki-laki', age: '', bloodType: 'Belum Tahu',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let nextFormData = { ...formData, [name]: value };

    if (name === 'birthDate' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      nextFormData.age = calculatedAge.toString();
    }
    
    setFormData(nextFormData);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email, password: formData.password,
      });
      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id, role: 'patient', full_name: formData.fullName, nik: formData.nik,
          address: formData.address, birth_date: formData.birthDate, gender: formData.gender, age: parseInt(formData.age, 10) || null, blood_type: formData.bloodType,
        }]);
        if (profileError) throw profileError;
        navigate('/patient/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="auth-card large">
        <div className="text-center mb-6">
          <h1 className="card-title">Pendaftaran Pasien</h1>
          <p className="card-desc">Lengkapi data diri Anda untuk membuat janji temu poli</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleRegister} className="grid-2">
          <div className="gap-6">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-600)', textTransform: 'uppercase', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Informasi Akun</h3>
            <div className="form-group"><label className="form-label" htmlFor="email">Email</label><input className="form-input" id="email" name="email" type="email" required value={formData.email} onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label" htmlFor="password">Password</label><input className="form-input" id="password" name="password" type="password" required minLength={6} value={formData.password} onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label" htmlFor="fullName">Nama Lengkap</label><input className="form-input" id="fullName" name="fullName" type="text" required value={formData.fullName} onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label" htmlFor="nik">NIK KTP</label><input className="form-input" id="nik" name="nik" type="text" required pattern="\d{16}" value={formData.nik} onChange={handleChange} /></div>
          </div>

          <div className="gap-6">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-600)', textTransform: 'uppercase', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Data Pribadi</h3>
            <div style={{ display: 'flex', gap: '1rem' }} className="form-group-mobile-stack">
              <div className="form-group" style={{ flex: 1 }}><label className="form-label" htmlFor="gender">Jenis Kelamin</label><select className="form-input" id="gender" name="gender" required value={formData.gender} onChange={handleChange}><option>Laki-laki</option><option>Perempuan</option></select></div>
              <div className="form-group" style={{ flex: 1 }}><label className="form-label" htmlFor="bloodType">Gol. Darah</label><select className="form-input" id="bloodType" name="bloodType" required value={formData.bloodType} onChange={handleChange}><option>Belum Tahu</option><option>A</option><option>B</option><option>AB</option><option>O</option></select></div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }} className="form-group-mobile-stack">
              <div className="form-group" style={{ flex: 1 }}><label className="form-label" htmlFor="birthDate">Tanggal Lahir</label><input className="form-input" id="birthDate" name="birthDate" type="date" required value={formData.birthDate} onChange={handleChange} /></div>
              <div className="form-group" style={{ width: '5rem', minWidth: '5rem' }}><label className="form-label" htmlFor="age">Usia</label><input className="form-input" id="age" name="age" type="number" required value={formData.age} onChange={handleChange} /></div>
            </div>
            <div className="form-group" style={{ flex: 1 }}><label className="form-label" htmlFor="address">Alamat Domisili</label><textarea className="form-input" id="address" name="address" required rows={4} value={formData.address} onChange={handleChange} style={{ height: '90px' }} /></div>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ padding: '1rem', fontSize: '1rem' }}>
              {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
            </button>
            <div className="text-center text-sm text-muted mt-6">
              Sudah punya akun? <Link to="/login" className="text-primary font-bold">Masuk di sini</Link>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
