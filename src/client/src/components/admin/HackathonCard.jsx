import { useNavigate } from "react-router-dom";
import "../../styles/admin.css";

const HackathonCard = ({ hackathon }) => {
  const navigate = useNavigate();

  // ✅ fallback logic (IMPORTANT)
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

  return (
    <div className="hackathon-card">
      <div className="hackathon-info">
        <div className="hackathon-header">
          {/* ✅ TITLE FIX */}
          <h3 className="hackathon-title">
            {title}
          </h3>

          <span className={`status-badge ${getStatusClass(hackathon.status)}`}>
            {hackathon.status}
          </span>
        </div>

        <div className="hackathon-meta">
          <span>
            {hackathon.startDate
              ? new Date(hackathon.startDate).toLocaleDateString()
              : "—"}{" "}
            –{" "}
            {hackathon.endDate
              ? new Date(hackathon.endDate).toLocaleDateString()
              : "—"}
          </span>
        </div>
      </div>

      <div className="hackathon-actions">
        <button
          className="action-btn"
          onClick={() => navigate(`/admin/hackathons/${hackathon._id}`)}
        >
          View
        </button>

        <button
          className="action-btn"
          onClick={() =>
            navigate(`/admin/hackathons/${hackathon._id}/dashboard`)
          }
        >
          Dashboard
        </button>

        <button
          className="action-btn"
          onClick={() =>
            navigate(`/admin/hackathons/${hackathon._id}/edit`)
          }
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default HackathonCard;
