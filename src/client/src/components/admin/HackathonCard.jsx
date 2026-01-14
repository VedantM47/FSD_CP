import { useNavigate } from 'react-router-dom';

function HackathonCard({ hackathon }) {
  const navigate = useNavigate();

  return (
    <div className="hackathon-card">
      <div className="hackathon-info">
        <div className="hackathon-header">
          <h3 className="hackathon-title">{hackathon.name}</h3>
          <span className={`status-badge status-live`}>
            {hackathon.status}
          </span>
        </div>

        <div className="hackathon-meta">
          <span>
            {hackathon.startDate} – {hackathon.endDate}
          </span>
          <span className="hackathon-divider">|</span>
          <span>Organizer: {hackathon.organization}</span>
        </div>
      </div>

      <div className="hackathon-actions">
        {/* VIEW PAGE */}
        <button
          className="action-btn"
          onClick={() =>
            navigate(`/admin/hackathons/${hackathon.id}`)
          }
        >
          View
        </button>

        {/* DASHBOARD PAGE (THIS IS WHAT YOU WANT) */}
        <button
          className="action-btn"
          onClick={() =>
            navigate(`/admin/hackathons/${hackathon.id}/dashboard`)
          }
        >
          Dashboard
        </button>

        {/* EDIT PAGE */}
        <button
          className="action-btn"
          onClick={() =>
            navigate(`/admin/hackathons/${hackathon.id}/edit`)
          }
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export default HackathonCard;
