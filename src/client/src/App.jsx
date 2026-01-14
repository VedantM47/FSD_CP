import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateHackathon from './pages/admin/CreateHackathon';
import ViewHackathon from './pages/admin/ViewHackathon';
import HackathonDashboard from './pages/admin/HackathonDashboard'; // ✅ ADD THIS

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/hackathons/create" element={<CreateHackathon />} />
      <Route path="/admin/hackathons/:id" element={<ViewHackathon />} />
      <Route path="/admin/hackathons/:id/edit" element={<CreateHackathon />} />

      {/* ✅ HACKATHON-SPECIFIC DASHBOARD */}
      <Route
        path="/admin/hackathons/:id/dashboard"
        element={<HackathonDashboard />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
