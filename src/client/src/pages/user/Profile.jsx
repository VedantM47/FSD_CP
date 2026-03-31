import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import ProfileHeader from "../../components/user/ProfileHeader";
import ProfileTabs from "../../components/user/ProfileTabs";
import OverviewTab from "../../components/user/tabs/OverviewTab";
import HackathonsTab from "../../components/user/tabs/HackathonsTab";
import TeamsTab from "../../components/user/tabs/TeamsTab";
import SubmissionsTab from "../../components/user/tabs/SubmissionsTab";
import SettingsTab from "../../components/user/tabs/SettingsTab";
import InvitationsTab from "../../components/user/tabs/InvitationsTab";
import { getMyProfile } from "../../services/api";
import "../../styles/profile.css";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyProfile();
      setProfile(res.data.data);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(
        err?.response?.data?.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ===== Loading ===== */
  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  /* ===== Error ===== */
  if (error) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-error">
          <p>{error}</p>
          <button onClick={fetchProfile}>Retry</button>
        </div>
      </div>
    );
  }

  const { user, stats, hackathons, teams, submissions, invitations } = profile;

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-layout">
        <ProfileHeader user={user} stats={stats} />
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} invitationCount={invitations?.length || 0} />

        {activeTab === "Overview" && (
          <OverviewTab
            user={user}
            hackathons={hackathons}
            teams={teams}
            navigate={navigate}
            onUpdate={fetchProfile}
          />
        )}

        {activeTab === "Hackathons" && (
          <HackathonsTab hackathons={hackathons} navigate={navigate} />
        )}

        {activeTab === "Teams" && (
          <TeamsTab teams={teams} navigate={navigate} />
        )}

        {activeTab === "Submissions" && (
          <SubmissionsTab submissions={submissions} />
        )}

        {activeTab === "Settings" && (
          <SettingsTab user={user} onUpdate={fetchProfile} />
        )}

        {activeTab === "Invitations" && (
          <InvitationsTab invitations={invitations || []} onUpdate={fetchProfile} />
        )}
      </div>

      {/* Footer */}
      <footer className="profile-footer">
        <div className="profile-footer__inner">
          <span className="profile-footer__brand">HackHub</span>
          <div className="profile-footer__links">
            <Link to="/about">About</Link>
            <Link to="/faqs">FAQs</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/terms">Terms & Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Profile;