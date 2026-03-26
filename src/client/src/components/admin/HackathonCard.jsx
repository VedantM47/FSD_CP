import { useNavigate } from "react-router-dom";
import "../../styles/admin.css";

const HackathonCard = ({ hackathon }) => {
  const navigate = useNavigate();

  // Fallback logic (IMPORTANT)
  const title = hackathon.title || hackathon.name || "Untitled Hackathon";

  const getStatusClass = (status) => {
    switch (status) {
      case "draft":
        return "status-draft";
      case "open":
        return "status-open";
      case "ongoing":
        return "status-live";
      case "closed":
        return "status-closed";
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return "";
      case "open":
        return "";
      case "ongoing":
        return "";
      case "closed":
        return "";
      default:
        return "";
    }
  };

  return (
    <div className="hackathon-card-grid">
      <div className="hackathon-card-header">
        <h3 className="hackathon-card-title" title={title}>
          {title}
        </h3>
        <span
          className={`status-badge-grid ${getStatusClass(hackathon.status)}`}
        >
          {getStatusIcon(hackathon.status)} {hackathon.status}
        </span>
      </div>

      <div className="hackathon-card-dates">
        <div className="date-item">
          <span className="date-label">Start:</span>
          <span className="date-value">
            {hackathon.startDate
              ? new Date(hackathon.startDate).toLocaleDateString()
              : "—"}
          </span>
        </div>
        <div className="date-item">
          <span className="date-label">End:</span>
          <span className="date-value">
            {hackathon.endDate
              ? new Date(hackathon.endDate).toLocaleDateString()
              : "—"}
          </span>
        </div>
      </div>

      {/* Optional: Display additional info */}
      {(hackathon.judgesCount !== undefined ||
        hackathon.teamsCount !== undefined) && (
        <div className="hackathon-card-stats">
          {hackathon.judgesCount !== undefined && (
            <div className="stat-item">
              <span className="stat-value">{hackathon.judgesCount} Judges</span>
            </div>
          )}
          {hackathon.teamsCount !== undefined && (
            <div className="stat-item">
              <span className="stat-value">{hackathon.teamsCount} Teams</span>
            </div>
          )}
        </div>
      )}

      <div className="hackathon-card-actions">
        <button
          className="action-btn-grid action-btn-view"
          onClick={() => navigate(`/admin/hackathons/${hackathon._id}`)}
          title="View Details"
        >
          View
        </button>

        <button
          className="action-btn-grid action-btn-dashboard"
          onClick={() =>
            navigate(`/admin/hackathons/${hackathon._id}/dashboard`)
          }
          title="View Dashboard"
        >
          Dashboard
        </button>

        <button
          className="action-btn-grid action-btn-edit"
          onClick={() => navigate(`/admin/hackathons/${hackathon._id}/edit`)}
          title="Edit Hackathon"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default HackathonCard;
