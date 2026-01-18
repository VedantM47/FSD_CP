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

/* participant pages */
import SingleHackathon from "./pages/participant/SingleHackathon";
import RegisterHackathon from "./pages/participant/RegisterHackathon";
import JoinTeam from "./pages/participant/JoinTeam";
import "./styles/auth.css";

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Judge Routes */}
      <Route path="/judge/hackathons" element={<AssignedHackathons />} />
      <Route path="/judge/hackathons/:id" element={<HackathonOverview />} />
      <Route
        path="/judge/hackathons/:id/submissions"
        element={<TeamSubmissions />}
      />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/hackathons/create" element={<CreateHackathon />} />
      <Route path="/admin/hackathons/:id" element={<ViewHackathon />} />
      <Route path="/admin/hackathons/:id/edit" element={<CreateHackathon />} />
      <Route
        path="/admin/hackathons/:id/dashboard"
        element={<HackathonDashboard />}
      />
      {/* participant routes */}
      <Route path="/user/hackathon/:id" element={<SingleHackathon />} />
      <Route path="/user/hackathon/:id/register" element={<RegisterHackathon />} />
      <Route path="/user/hackathon/:id/JoinTeam" element={<JoinTeam />} />
      
      


      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
