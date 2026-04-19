import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Pill } from 'lucide-react';
import { motion } from 'framer-motion';

export const PatientEMR = () => {
  const { profile } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) fetchRecords();
  }, [profile]);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('medical_records')
      .select(`id, diagnosis, medicine, actions, created_at, doctors(profiles(full_name), polyclinics(name))`)
      .eq('patient_id', profile!.id)
      .order('created_at', { ascending: false });
    if (!error && data) setRecords(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl gap-6">
      <div className="mb-6">
        <h2 className="card-title text-primary">Rekam Medis (EMR)</h2>
        <p className="card-desc">Riwayat medis dan hasil diagnosa dokter.</p>
      </div>

      {loading ? (
        <div className="text-center p-8 mt-6">Loading data...</div>
      ) : records.length === 0 ? (
        <div className="card text-center text-muted">Belum ada data rekam medis.</div>
      ) : (
        <div className="gap-4">
          {records.map((rec, idx) => (
            <motion.div key={rec.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="card">
              <div className="flex-between mb-4" style={{ borderBottom: '1px solid var(--neutral-200)', paddingBottom: '1rem' }}>
                <div>
                  <h3 className="font-bold text-primary">Pemeriksaan {new Date(rec.created_at).toLocaleDateString('id-ID')}</h3>
                  <p className="text-sm text-muted">dr. {rec.doctors.profiles?.full_name || 'Tidak diketahui'} • {rec.doctors.polyclinics.name}</p>
                </div>
                <div style={{ background: 'var(--primary-50)', color: 'var(--primary-700)', padding: '0.5rem', borderRadius: 'var(--radius-lg)' }}>
                  <FileText size={20} />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--neutral-900)', marginBottom: '0.5rem' }}>Diagnosa & Tindakan</h4>
                  <div style={{ background: 'var(--neutral-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--neutral-700)', minHeight: '4rem' }}>
                    <p><strong>Diagnosa:</strong> {rec.diagnosis}</p>
                    {rec.actions && <p className="mt-4"><strong>Tindakan:</strong> {rec.actions}</p>}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--neutral-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Pill size={14} className="text-primary" /> Resep Obat
                  </h4>
                  <div style={{ background: 'var(--neutral-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--neutral-700)', minHeight: '4rem', whiteSpace: 'pre-wrap' }}>
                    {rec.medicine}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
