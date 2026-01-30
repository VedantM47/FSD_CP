import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

/* Judge Pages */
import AssignedHackathons from "./pages/judge/AssignedHackathons";
import HackathonOverview from "./pages/judge/HackathonOverview";
import TeamSubmissions from "./pages/judge/TeamSubmissions";

/* Admin Pages */
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateHackathon from "./pages/admin/CreateHackathon";
import ViewHackathon from "./pages/admin/ViewHackathon";
import HackathonDashboard from "./pages/admin/HackathonDashboard";

/* User Pages */
import Profile from "./pages/user/Profile";
import Discovery from "./pages/user/Discovery";
import Calendar from "./pages/user/Calendar";

/* participant pages */
import SingleHackathon from "./pages/participant/SingleHackathon";
import RegisterHackathon from "./pages/participant/RegisterHackathon";
import JoinTeam from "./pages/participant/JoinTeam";
import "./styles/auth.css";
import "./styles/global.css";

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Judge Routes */}
      <Route path="/judge/hackathons" element={<AssignedHackathons />} />
      <Route path="/judge/hackathons/:id" element={<HackathonOverview />} />
      <Route
        path="/judge/hackathons/:id/submissions"
        element={<TeamSubmissions />}
      />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/hackathons/create" element={<CreateHackathon />} />
      <Route path="/admin/hackathons/:id" element={<ViewHackathon />} />
      <Route path="/admin/hackathons/:id/edit" element={<CreateHackathon />} />
      <Route path="/admin/hackathons/:id/dashboard" element={<HackathonDashboard />} />
      {/* participant routes */}
      <Route path="/user/hackathon/:id" element={<SingleHackathon />} />
      <Route path="/user/hackathon/:id/register" element={<RegisterHackathon />} />
      <Route path="/user/hackathon/:id/JoinTeam" element={<JoinTeam />} />


      {/* ================= USER ROUTES ================= */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/discovery" element={<Discovery />} />
      <Route path="/calendar" element={<Calendar />} />


      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
