import React from "react";
import { Users, Globe, CalendarDays, Trophy, CheckCircle2 } from "lucide-react";

const HackathonCard = ({ hackathon, onRegister, onViewDetails }) => {
  // --- BUTTON LOGIC HELPERS ---
  const isRegistered = hackathon.isRegistered;
  const isOngoing = hackathon.status === "ongoing";
  const isClosed = hackathon.status === "closed" || hackathon.status === "past";
  const isDraft = hackathon.status === "draft";
  const isRegistrationClosed = hackathon.isRegistrationClosed; // Naya prop fetch kiya

  const renderMainButton = () => {
    // Case 1: If user is already registered
    if (isRegistered) {
      return (
        <button
          className="btn-registered"
          onClick={onViewDetails}
        >
          <span className="tick-icon">✓</span>
          Registered
        </button>
      );
    }

    // Case 2: If hackathon is in DRAFT
    if (isDraft) {
      return (
        <button className="btn-primary btn-disabled" disabled>
          Coming Soon
        </button>
      );
    }

    // Case 3: If registration is closed (Date passed or Admin closed it)
    if (isOngoing || isClosed || isRegistrationClosed) {
      return (
        <button className="btn-primary btn-disabled" disabled>
          {isOngoing ? "Ongoing" : "Registration Closed"}
        </button>
      );
    }

    // Default: Registration Open
    return (
      <button className="btn-primary" onClick={onRegister} style={{ flex: 1 }}>
        Register Now
      </button>
    );
  };

  return (
    <div className="hackathon-card">
      <div className="card-image-container">
        <img
          src={hackathon.image}
          alt={hackathon.name}
          className="card-image"
        />
        <span className={`status-badge status-${hackathon.status}`} style={{ textTransform: 'capitalize' }}>
          {hackathon.status}
        </span>
      </div>

      <div className="card-content">
        <h3 className="card-title">{hackathon.name}</h3>
        <p className="card-org">by {hackathon.organization}</p>
        <p className="card-description">{hackathon.description}</p>

        <div className="tag-container" style={{ margin: '4px 0 8px 0' }}>
          {hackathon.tags &&
            hackathon.tags.map((tag) => (
              <span key={tag} className={`tag tag-${tag}`} style={{ textTransform: 'capitalize' }}>
                {tag}
              </span>
            ))}
        </div>

        <div className="info-grid">
          <div className="info-item">
            <Users size={10} color="#64748b" /> <span>{hackathon.teamSize}</span>
          </div>
          <div className="info-item">
            <Globe size={10} color="#64748b" /> <span>{hackathon.mode}</span>
          </div>
          <div className="info-item">
            <CalendarDays size={10} color="#64748b" /> <span>{hackathon.deadline}</span>
          </div>
          <div className="info-item">
            <Trophy size={10} color="#64748b" /> <span>{hackathon.prizePool}</span>
          </div>
          <div className="info-item"></div>
        </div>
      </div>

      <div className="card-actions">
        {renderMainButton()}
        {!isRegistered && (
          <button
            className="btn-secondary"
            onClick={onViewDetails}
            style={{ flex: 1 }}
          >
            Details
          </button>
        )}
      </div>
    </div>
  );
};

export default HackathonCard;
