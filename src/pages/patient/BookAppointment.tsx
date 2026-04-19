import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Polyclinic { id: string; name: string; description: string; }
interface Doctor { id: string; profile_id: string; specialization: string; profiles: { full_name: string; }; }

export const BookAppointment = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [polyclinics, setPolyclinics] = useState<Polyclinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  const [selectedPoli, setSelectedPoli] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchPoli(); }, []);
  useEffect(() => { if (selectedPoli) fetchDoctors(selectedPoli); else setDoctors([]); }, [selectedPoli]);

  const fetchPoli = async () => {
    const { data } = await supabase.from('polyclinics').select('*');
    if (data) setPolyclinics(data);
  };

  const fetchDoctors = async (poliId: string) => {
    const { data } = await supabase.from('doctors').select('id, profile_id, specialization, profiles(full_name)').eq('polyclinic_id', poliId);
    if (data) setDoctors(data as unknown as Doctor[]);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true); setError('');
    try {
      const { error } = await supabase.from('appointments').insert([{ patient_id: profile.id, doctor_id: selectedDoctor, polyclinic_id: selectedPoli, appointment_date: date, appointment_time: time }]);
      if (error) throw error;
      navigate('/patient/appointments');
    } catch (err: any) {
      setError(err.message || 'Gagal membuat janji temu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="card">
        <h2 className="card-title">Booking Janji Temu</h2>
        <p className="card-desc mb-6">Pilih poliklinik dan dokter yang tersedia sesuai kebutuhan Anda.</p>
        
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleBooking} className="gap-6">
          <div className="form-group">
            <label className="form-label" htmlFor="poli">Poliklinik</label>
            <select className="form-input" id="poli" required value={selectedPoli} onChange={(e) => { setSelectedPoli(e.target.value); setSelectedDoctor(''); }}>
              <option value="" disabled>-- Pilih Poli --</option>
              {polyclinics.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="doctor">Dokter</label>
            <select className="form-input" id="doctor" required disabled={!selectedPoli || doctors.length === 0} value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
              <option value="" disabled>-- Pilih Dokter --</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.profiles?.full_name} ({d.specialization})</option>)}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="date">Tanggal</label>
              <input className="form-input" id="date" type="date" required min={new Date().toISOString().split('T')[0]} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="time">Jam (Estimasi)</label>
              <input className="form-input" id="time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-4">
            {loading ? 'Memproses...' : 'Konfirmasi Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};
