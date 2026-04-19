import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Patient Pages
import { PatientDashboard } from './pages/patient/Dashboard';
import { BookAppointment } from './pages/patient/BookAppointment';
import { PatientHistory } from './pages/patient/History';
import { PatientEMR } from './pages/patient/EMR';

// Nakes Pages
import { NakesDashboard } from './pages/nakes/Dashboard';
import { InputEMR } from './pages/nakes/InputEMR';
import { NakesPatients } from './pages/nakes/Patients';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route element={<Layout />}>
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/book" element={<BookAppointment />} />
              <Route path="/patient/appointments" element={<PatientHistory />} />
              <Route path="/patient/records" element={<PatientEMR />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['nakes']} />}>
            <Route element={<Layout />}>
              <Route path="/nakes/dashboard" element={<NakesDashboard />} />
              <Route path="/nakes/patients" element={<NakesPatients />} />
              <Route path="/nakes/appointments/:id/record" element={<InputEMR />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
