import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home/Home";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import LoginSuccess from "./components/auth/LoginSuccess"; // Check path
/* Judge Pages */
import AssignedHackathons from "./pages/judge/AssignedHackathons";
import HackathonOverview from "./pages/judge/HackathonOverview";
import TeamSubmissions from "./pages/judge/TeamSubmissions";

/* Admin/Organizer Pages */
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrganizerDashboard from "./pages/admin/OrganizerDashboard";
import CreateHackathon from "./pages/admin/CreateHackathon";
import ViewHackathon from "./pages/admin/ViewHackathon";
import HackathonDashboard from "./pages/admin/HackathonDashboard";

/* User Pages */
import Profile from "./pages/user/Profile";
import PublicProfile from "./pages/user/PublicProfile";
import Discovery from "./pages/user/Discovery";
import Calendar from "./pages/user/Calendar";
import ApplyOrganizer from "./pages/user/ApplyOrganizer";

/* participant pages */
import SingleHackathon from "./pages/participant/SingleHackathon";
import ParticipantDashboard from "./pages/participant/ParticipantDashboard";
import RegisterHackathon from "./pages/participant/RegisterHackathon";
import JoinTeam from "./pages/participant/JoinTeam";
import SubmitProject from "./pages/participant/SubmitProject";
import ManageTeam from "./pages/participant/ManageTeam";
import TeamDetails from "./pages/participant/TeamDetails";
import FindMembers from "./pages/participant/FindMembers";

/* Hackathon Pages */
import Discussion from "./pages/hackathon/Discussion";

import "./styles/auth.css";
import "./styles/global.css";

function App() {
  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login-success" element={<LoginSuccess />} />
      <Route path="/calendar" element={<Calendar />} />

      {/* ===== ADMIN-ONLY ROUTES ===== */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* ===== ORGANIZER & ADMIN SHARED ROUTES ===== */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "mentor","user"]} />}>
       
        <Route path="/admin/hackathons/create" element={<CreateHackathon />} />
        <Route path="/admin/hackathons/:id" element={<ViewHackathon />} />
        <Route path="/admin/hackathons/:id/edit" element={<CreateHackathon />} />
        <Route path="/admin/hackathons/:id/dashboard" element={<HackathonDashboard />} />
      </Route>

      {/* ===== PROTECTED ROUTES (any authenticated user) ===== */}
      <Route element={<ProtectedRoute />}>
        {/* Judge Routes */}
         <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/judge/hackathons" element={<AssignedHackathons />} />
        <Route path="/judge/hackathons/:id" element={<HackathonOverview />} />
        <Route path="/judge/hackathons/:id/submissions" element={<TeamSubmissions />} />

        <Route path="/user/hackathon/:id" element={<SingleHackathon />} />

        {/* User Routes */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<PublicProfile />} />
        <Route path="/discovery" element={<Discovery />} />
        <Route path="/apply-organizer" element={<ApplyOrganizer />} />

        {/* Hackathon Routes */}
        <Route path="/hackathon/:id/discussion" element={<Discussion />} />
      </Route>

      {/* Participant Routes (Blocked for Admins & Judges) */}
      <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
        <Route path="/user/hackathon/:id/register" element={<RegisterHackathon />} />
        <Route path="/user/hackathon/:id/dashboard" element={<ParticipantDashboard />} />
        <Route path="/user/hackathon/:id/JoinTeam" element={<JoinTeam />} />
        <Route path="/user/hackathon/:id/submit" element={<SubmitProject />} />
        <Route path="/user/hackathon/:id/manage-team" element={<ManageTeam />} />
        <Route path="/user/hackathon/:id/team/:teamId" element={<TeamDetails />} />
        <Route path="/user/hackathon/:id/team/:teamId/find-members" element={<FindMembers />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
