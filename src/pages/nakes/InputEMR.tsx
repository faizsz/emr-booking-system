import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

export const InputEMR = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ diagnosis: '', actions: '', medicine: '' });

  useEffect(() => { if (id) fetchAppointment(); }, [id]);

  const fetchAppointment = async () => {
    const { data } = await supabase.from('appointments').select(`id, patient_id, doctor_id, status, profiles!patient_id(full_name, age, gender, nik, address)`).eq('id', id).single();
    if (data) setAppointment(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !profile) return;
    setSubmitting(true); setError('');

    try {
      const { error: emrError } = await supabase.from('medical_records').insert([{ appointment_id: appointment.id, patient_id: appointment.patient_id, doctor_id: appointment.doctor_id, diagnosis: formData.diagnosis, actions: formData.actions, medicine: formData.medicine }]);
      if (emrError) throw emrError;

      const { error: aptError } = await supabase.from('appointments').update({ status: 'selesai' }).eq('id', appointment.id);
      if (aptError) throw aptError;

      navigate('/nakes/dashboard');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan rekam medis.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-8 mt-6">Loading data...</div>;
  if (!appointment) return <div className="text-center p-8 mt-6 text-[var(--danger-600)]">Janji Temu tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl gap-6">
      <div className="flex-between mb-6">
        <div>
          <h2 className="card-title text-primary">Input Rekam Medis</h2>
          <p className="card-desc">Masukkan diagnosa, tindakan, dan resep untuk kunjungan ini.</p>
        </div>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--neutral-600)', cursor: 'pointer', fontWeight: 600 }}>&larr; Kembali</button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="grid-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <h3 className="card-title" style={{ fontSize: '1rem', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Data Pasien</h3>
          <div className="gap-2 text-sm" style={{ flexDirection: 'column' }}>
            <div><span style={{ display: 'block', color: 'var(--neutral-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Nama Lengkap</span><span className="font-semibold">{appointment.profiles.full_name}</span></div>
            <div><span style={{ display: 'block', color: 'var(--neutral-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>NIK</span><span>{appointment.profiles.nik || '-'}</span></div>
            <div><span style={{ display: 'block', color: 'var(--neutral-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Usia / Gender</span><span>{appointment.profiles.age} Thn / {appointment.profiles.gender}</span></div>
            <div><span style={{ display: 'block', color: 'var(--neutral-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Alamat</span><span>{appointment.profiles.address || '-'}</span></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <form onSubmit={handleSave} className="gap-4">
            <div className="form-group"><label className="form-label">Hasil Diagnosa <span style={{ color: 'var(--danger-500)' }}>*</span></label><textarea className="form-input" required rows={3} value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Tindakan Medis</label><textarea className="form-input" rows={2} value={formData.actions} onChange={e => setFormData({...formData, actions: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Resep Obat <span style={{ color: 'var(--danger-500)' }}>*</span></label><textarea className="form-input" required rows={3} value={formData.medicine} onChange={e => setFormData({...formData, medicine: e.target.value})} /></div>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--neutral-200)', display: 'flex', justifyContent: 'flex-end' }}>
               <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Menyimpan...' : 'Simpan EMR & Selesaikan'}</button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
