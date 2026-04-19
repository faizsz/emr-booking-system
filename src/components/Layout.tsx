import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon, CalendarPlus, History, FileText, Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export const Layout = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const isPatient = profile?.role === 'patient';
  const menuItems = isPatient ? [
    { name: 'Dashboard', path: '/patient/dashboard', icon: Activity },
    { name: 'Booking Poli', path: '/patient/book', icon: CalendarPlus },
    { name: 'Riwayat', path: '/patient/appointments', icon: History },
    { name: 'Rekam Medis', path: '/patient/records', icon: FileText },
  ] : [
    { name: 'Dashboard', path: '/nakes/dashboard', icon: Activity },
    { name: 'Data Pasien', path: '/nakes/patients', icon: Users },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div style={{ width: '2.5rem', height: '2.5rem', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)' }}>
            <Activity size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-900)' }}>KlinikKu</h2>
        </div>
        
        <div className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                <Icon size={20} /> {item.name}
              </Link>
            );
          })}
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--neutral-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 0.5rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', background: 'var(--neutral-100)', color: 'var(--neutral-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name}</p>
              <p style={{ color: 'var(--neutral-500)', fontSize: '0.75rem', textTransform: 'capitalize' }}>{profile?.role}</p>
            </div>
          </div>
          <button onClick={signOut} className="btn btn-full" style={{ background: 'var(--danger-50)', color: 'var(--danger-700)' }}>
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--neutral-800)' }}>
            {menuItems.find(i => location.pathname.startsWith(i.path))?.name || 'KlinikKu'}
          </h1>
        </header>
        <div className="content-scroll">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};
