import { useState } from "react";
import { API, getAuthHeaders } from "../../../services/api";

const OverviewTab = ({ user, hackathons, teams, navigate, onUpdate }) => {
  const activeHackathons = (hackathons || []).filter(
    (h) => h.status === "In Progress" || h.status === "Registered"
  );

  // Build activity items from hackathons
  const activityItems = (hackathons || [])
    .slice(0, 6)
    .map((h, i) => {
      let text = "";
      if (h.status === "In Progress") text = `Participating in ${h.title}`;
      else if (h.status === "Completed")
        text = h.result && h.result !== "-"
          ? `${h.result} in ${h.title}`
          : `Completed ${h.title}`;
      else text = `Registered for ${h.title}`;

      return { text, time: formatTimeAgo(h.startDate), key: i };
    });

  // First team where user is leader (for team info card)
  const primaryTeam = (teams || []).find((t) => t.isLeader) || teams?.[0];
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleJoin = async () => {
    if (!primaryTeam || !primaryTeam.isLeader || isToggling) return;
    
    try {
      setIsToggling(true);
      await API.patch(`/teams/${primaryTeam._id}`, {
        isOpenToJoin: !primaryTeam.isOpenToJoin
      }, getAuthHeaders());
      
      if (onUpdate) onUpdate(); // Refresh profile data
    } catch (err) {
      console.error("Failed to toggle team status:", err);
      alert("Failed to update team status.");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <div className="overview-grid">
        {/* Left: Active Hackathons */}
        <div className="overview-card">
          <h3 className="overview-card__title">Active Hackathons</h3>

          {activeHackathons.length === 0 ? (
            <div className="empty-state">
              <p>No active hackathons right now.</p>
            </div>
          ) : (
            activeHackathons.map((h) => (
              <div key={h._id} className="active-hack-item">
                <h4>{h.title}</h4>
                {h.teamName && (
                  <p className="organizer">{h.teamName}</p>
                )}
                <p className="round-info">
                  <strong>Status:</strong> {h.status}
                </p>
                <p className="deadline">
                  Ends:{" "}
                  {h.endDate
                    ? new Date(h.endDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    : "TBD"}
                </p>
                <div className="active-hack-btns">
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/user/hackathon/${h._id}`)}
                  >
                    View Hackathon
                  </button>
                  <button
                    className="btn-discussion"
                    onClick={() => navigate(`/hackathon/${h._id}/discussion`)}
                  >
                    Discussion
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Recent Activity */}
        <div className="overview-card">
          <h3 className="overview-card__title">Recent Activity</h3>

          {activityItems.length === 0 ? (
            <div className="empty-state">
              <p>No recent activity.</p>
            </div>
          ) : (
            <ul className="activity-timeline">
              {activityItems.map((item) => (
                <li key={item.key} className="activity-item">
                  <div className="activity-dot-col">
                    <span className="activity-dot" />
                    {item.key !== activityItems.length - 1 && (
                      <span className="activity-line" />
                    )}
                  </div>
                  <div className="activity-content">
                    <p>{item.text}</p>
                    <span>{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Team Info */}
      {primaryTeam && (
        <div className="team-info-card">
          <h3 className="team-info-card__title">Team Information</h3>

          <div className="team-info-card__header">
            <h4>{primaryTeam.name}</h4>
            {primaryTeam.isLeader && (
              <span className="leader-badge">Leader</span>
            )}
          </div>

          {(primaryTeam.members || [])
            .filter((m) => m.status === "accepted")
            .map((m, i) => (
              <div key={i} className="team-member-row">
                <span className="name">{m.name}</span>
                <span className="role">{m.role}</span>
              </div>
            ))}

          <div className="team-open-toggle">
            <span>Looking for members</span>
            <ToggleSwitch 
              enabled={primaryTeam.isOpenToJoin} 
              readOnly={!primaryTeam.isLeader} 
              onClick={handleToggleJoin}
            />
          </div>
        </div>
      )}

      {/* Skills & Interests Display */}
      <div className="overview-grid" style={{ marginTop: '20px' }}>
        <div className="overview-card">
          <h3 className="overview-card__title">Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {user?.skills?.length > 0 ? (
              user.skills.map(skill => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>No skills added yet.</p>
            )}
          </div>
        </div>

        <div className="overview-card">
          <h3 className="overview-card__title">Interests</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {user?.interests?.length > 0 ? (
              user.interests.map(interest => (
                <span key={interest} className="skill-tag" style={{ background: '#fef3c7', color: '#d97706', borderColor: '#fde68a' }}>
                  {interest}
                </span>
              ))
            ) : (
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>No interests added yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* ===== Helpers ===== */
function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
}

const ToggleSwitch = ({ enabled, readOnly, onClick }) => (
  <button
    className={`toggle-switch ${enabled ? "toggle-switch--on" : "toggle-switch--off"}`}
    disabled={readOnly}
    onClick={onClick}
    style={{ cursor: readOnly ? "default" : "pointer" }}
    type="button"
  >
    <div className="toggle-switch__knob" />
  </button>
);

export default OverviewTab;