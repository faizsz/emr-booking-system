import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const PatientDashboard = () => {
  const { profile } = useAuth();
  
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
        <h2 className="card-title">Selamat Datang, {profile?.full_name}</h2>
        <p className="card-desc">Ini adalah dashboard pasien. Anda dapat melihat ringkasan aktivitas kesehatan Anda di sini.</p>
      </motion.div>
      
      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Profil Singkat</h3>
          <ul style={{ listStyle: 'none', gap: '0.75rem', display: 'flex', flexDirection: 'column', fontSize: '0.875rem' }}>
            <li><strong>NIK:</strong> {profile?.nik || '-'}</li>
            <li><strong>Umur:</strong> {profile?.age ? `${profile.age} Tahun` : '-'}</li>
            <li><strong>Jenis Kelamin:</strong> {profile?.gender || '-'}</li>
          </ul>
        </div>
        
        <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary-50), var(--primary-100))', borderColor: 'var(--primary-200)' }}>
           <h3 style={{ color: 'var(--primary-800)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.25rem' }}>Punya keluhan?</h3>
           <p style={{ color: 'var(--primary-600)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Segera jadwalkan janji temu dengan dokter kami.</p>
           <Link to="/patient/book" className="btn btn-primary shadow-md">Booking Poli Sekarang</Link>
        </div>
      </div>
    </div>
  );
};
