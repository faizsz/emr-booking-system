import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export const NakesPatients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'patient').order('full_name', { ascending: true });
    if (data) setPatients(data);
    setLoading(false);
  };

  const filteredPatients = patients.filter(p => p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.nik?.includes(search));

  return (
    <div className="page-container">
      <div className="flex-between mb-6">
        <div>
          <h2 className="card-title text-primary">Data Pasien</h2>
          <p className="card-desc">Direktori seluruh pasien yang terdaftar di sistem klinik.</p>
        </div>
        <div style={{ width: '18rem' }}>
          <input className="form-input" type="text" placeholder="Cari nama atau NIK..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 mt-6">Loading data...</div>
      ) : (
        <div className="table-wrapper">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Nama Lengkap</th>
                <th>NIK</th>
                <th>Usia</th>
                <th>Gender</th>
                <th>Kontak / Alamat</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(p => (
                <tr key={p.id}>
                  <td className="font-semibold" style={{ color: 'var(--neutral-900)' }}>{p.full_name}</td>
                  <td style={{ fontFamily: 'monospace' }}>{p.nik || '-'}</td>
                  <td>{p.age ? `${p.age} Thn` : '-'}</td>
                  <td>{p.gender || '-'}</td>
                  <td className="text-muted" style={{ maxWidth: '16rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.address}>{p.address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPatients.length === 0 && <div className="text-center p-8 text-muted">Tidak ada data yang cocok dengan pencarian Anda.</div>}
        </div>
      )}
    </div>
  );
};
