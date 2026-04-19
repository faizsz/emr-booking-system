import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const NakesDashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase.from('appointments').select(`id, appointment_date, appointment_time, queue_number, status, profiles!patient_id(full_name, age, gender), polyclinics(name)`).order('appointment_date', { ascending: true }).order('queue_number', { ascending: true });
    if (data) setAppointments(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    fetchAppointments();
  };

  return (
    <div className="page-container">
      <div className="mb-6">
        <h2 className="card-title text-primary">Daftar Antrean Hari Ini</h2>
        <p className="card-desc">Kelola dan perbarui status janji temu pasien.</p>
      </div>

      {loading ? (
        <div className="text-center p-8 mt-6">Loading data...</div>
      ) : (
        <div className="table-wrapper">
          <table className="ui-table">
            <thead>
              <tr>
                <th>No. Antrean & Jam</th>
                <th>Pasien</th>
                <th>Poli</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, idx) => (
                <motion.tr key={apt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary-600)' }}>#{apt.queue_number}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> {apt.appointment_time}
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold">{apt.profiles.full_name}</div>
                    <div className="text-sm text-muted">{apt.profiles.gender}, {apt.profiles.age} thn</div>
                  </td>
                  <td style={{ color: 'var(--neutral-700)' }}>{apt.polyclinics.name}</td>
                  <td>
                    {apt.status === 'menunggu' && <span className="badge badge-warning">Menunggu</span>}
                    {apt.status === 'selesai' && <span className="badge badge-success">Selesai</span>}
                    {apt.status === 'dibatalkan' && <span className="badge badge-danger">Batal</span>}
                  </td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {apt.status === 'menunggu' && (
                        <>
                          <Link to={`/nakes/appointments/${apt.id}/record`} className="btn btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}>Tindak & Rekam</Link>
                          <button onClick={() => handleUpdateStatus(apt.id, 'dibatalkan')} className="btn btn-danger-outline" style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}>Batal</button>
                        </>
                      )}
                      {apt.status === 'selesai' && (
                        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--success-600)', fontSize: '0.875rem', fontWeight: 500, gap: '0.25rem' }}>
                          <CheckCircle size={16}/> Selesai
                        </span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && <div className="text-center p-8 text-muted">Tidak ada antrean hari ini.</div>}
        </div>
      )}
    </div>
  );
};
