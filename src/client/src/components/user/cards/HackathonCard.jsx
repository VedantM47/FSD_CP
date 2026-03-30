import React from "react";

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
          className="btn-success"
          onClick={onViewDetails}
          style={{
            flex: 1,
            background: "#10b981",
            color: "white",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer"
          }}
        >
          <span
            style={{
              background: "white",
              color: "#10b981",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            ✓
          </span>
          Registered
        </button>
      );
    }

    // Case 2: If hackathon is in DRAFT
    if (isDraft) {
      return (
        <button
          className="btn-primary"
          disabled
          style={{
            flex: 1,
            background: "#f1f5f9",
            color: "#94a3b8",
            border: "1px solid #e2e8f0",
            cursor: "not-allowed",
          }}
        >
          Coming Soon
        </button>
      );
    }

    // Case 3: If registration is closed (Date passed or Admin closed it)
    if (isOngoing || isClosed || isRegistrationClosed) {
      return (
        <button
          className="btn-primary"
          disabled
          style={{
            flex: 1,
            background: "#f1f5f9",
            color: "#94a3b8",
            border: "1px solid #e2e8f0",
            cursor: "not-allowed",
          }}
        >
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
        <span className={`status-badge status-${hackathon.status}`}>
          {hackathon.status}
        </span>
      </div>

      <div className="card-content">
        <h3 className="card-title">{hackathon.name}</h3>
        <p className="card-org">by {hackathon.organization}</p>
        <p className="card-description">{hackathon.description}</p>

        <div className="tag-container">
          {hackathon.tags &&
            hackathon.tags.map((tag) => (
              <span key={tag} className={`tag tag-${tag}`}>
                {tag}
              </span>
            ))}
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span>•</span> Team Size: {hackathon.teamSize}
          </div>
          <div className="info-item">
            <span>•</span> Mode: {hackathon.mode}
          </div>
          <div className="info-item">
            <span>•</span> Deadline: {hackathon.deadline}
          </div>
          <div className="info-item">
            <span>•</span> Prize Pool: {hackathon.prizePool}
          </div>
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
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default HackathonCard;
