import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Stethoscope, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'patient' | 'nakes'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData.role !== role) {
          await supabase.auth.signOut();
          throw new Error(`Akun ini tidak terdaftar sebagai ${role === 'nakes' ? 'Tenaga Kesehatan' : 'Pasien'}.`);
        }

        if (role === 'nakes') {
          navigate('/nakes/dashboard');
        } else {
          navigate('/patient/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Gagal login. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
      >
        <div className="text-center mb-6">
          <h1 className="card-title">Selamat Datang</h1>
          <p className="card-desc">Masuk ke portal pelayanan kesehatan KlinikKu</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => setRole('patient')}
            style={{
              flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
              borderRadius: 'var(--radius-xl)', border: `2px solid ${role === 'patient' ? 'var(--primary-500)' : 'var(--neutral-200)'}`,
              background: role === 'patient' ? 'var(--primary-50)' : 'transparent',
              color: role === 'patient' ? 'var(--primary-700)' : 'var(--neutral-500)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <UserRound size={24} />
            <span className="font-semibold">Pasien</span>
          </button>
          
          <button
            type="button"
            onClick={() => setRole('nakes')}
            style={{
              flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
              borderRadius: 'var(--radius-xl)', border: `2px solid ${role === 'nakes' ? 'var(--primary-500)' : 'var(--neutral-200)'}`,
              background: role === 'nakes' ? 'var(--primary-50)' : 'transparent',
              color: role === 'nakes' ? 'var(--primary-700)' : 'var(--neutral-500)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Stethoscope size={24} />
            <span className="font-semibold">Nakes</span>
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input className="form-input" id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Masukkan email" />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input className="form-input" id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-4" style={{ padding: '0.875rem' }}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {role === 'patient' && (
          <div className="text-center text-sm text-muted mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary font-semibold">Daftar sekarang</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};
