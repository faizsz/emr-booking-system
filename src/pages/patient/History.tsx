import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const PatientHistory = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) fetchHistory();
  }, [profile]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select(`id, appointment_date, appointment_time, queue_number, status, polyclinics(name), doctors(profiles(full_name))`)
      .eq('patient_id', profile!.id).order('appointment_date', { ascending: false });
    if (!error && data) setAppointments(data);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu': return <span className="badge badge-warning"><Clock size={14}/> Menunggu</span>;
      case 'selesai': return <span className="badge badge-success"><CheckCircle size={14}/> Selesai</span>;
      case 'dibatalkan': return <span className="badge badge-danger"><XCircle size={14}/> Batal</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl gap-6">
      <div className="mb-6">
        <h2 className="card-title text-primary">Riwayat Janji Temu</h2>
        <p className="card-desc">Pantau status reservasi poliklinik Anda di sini.</p>
      </div>

      {loading ? (
        <div className="text-center p-8 mt-6">Loading data...</div>
      ) : appointments.length === 0 ? (
        <div className="card text-center text-muted">Belum ada riwayat janji temu.</div>
      ) : (
        <div className="grid-2">
          {appointments.map((apt, idx) => (
            <motion.div key={apt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="card">
              <div className="flex-between mb-4">
                <div>
                  <h3 className="font-bold text-primary">{apt.polyclinics.name}</h3>
                  <p className="text-sm text-muted">dr. {apt.doctors.profiles?.full_name || 'Tidak diketahui'}</p>
                </div>
                {getStatusBadge(apt.status)}
              </div>
              
              <div style={{ background: 'var(--neutral-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', border: '1px solid var(--neutral-100)' }}>
                <div>
                  <span style={{ display: 'block', color: 'var(--neutral-500)', fontSize: '0.75rem' }}>Tanggal</span>
                  <span className="font-semibold">{apt.appointment_date} {apt.appointment_time}</span>
                </div>
                <div className="text-right">
                  <span style={{ display: 'block', color: 'var(--neutral-500)', fontSize: '0.75rem' }}>No. Antrean</span>
                  <span className="font-bold text-primary" style={{ fontSize: '1.25rem' }}>{apt.queue_number}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
