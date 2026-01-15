import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AssignedHackathons from "./pages/judge/AssignedHackathons";
import HackathonOverview from "./pages/judge/HackathonOverview";
import TeamSubmissions from "./pages/judge/TeamSubmissions";
import "./styles/auth.css";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/judge/hackathons" element={<AssignedHackathons />} />
      <Route path="/judge/hackathons/:id" element={<HackathonOverview />} />
      <Route
        path="/judge/hackathons/:id/submissions"
        element={<TeamSubmissions />}
      />
      <Route path="*" element={<Signup />} />
    </Routes>
  );
}

export default App;
