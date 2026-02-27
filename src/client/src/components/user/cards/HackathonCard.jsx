import React from "react";

const HackathonCard = ({ hackathon, onRegister, onViewDetails }) => {
  // --- BUTTON LOGIC HELPERS ---
  const isRegistered = hackathon.isRegistered; 
  const isOngoing = hackathon.status === "ongoing";
  const isClosed = hackathon.status === "closed" || hackathon.status === "past";
  const isDraft = hackathon.status === "draft"; // Naya check Draft ke liye

  /**
   * ── renderMainButton ──
   * Logic:
   * 1. Registered -> ✓ Registered
   * 2. Draft -> Coming Soon (Disabled)
   * 3. Ongoing/Closed -> Status Name (Disabled)
   * 4. Open -> Register Now
   */
  const renderMainButton = () => {
    // Case 1: Agar user already registered hai
    if (isRegistered) {
      return (
        <button 
          className="btn-registered" 
          onClick={onViewDetails}
          style={{ 
            flex: 1, 
            background: '#ecfdf5', 
            color: '#059669', 
            border: '1.5px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: '700'
          }}
        >
          <span style={{ 
            background: '#10b981', 
            color: 'white', 
            borderRadius: '50%', 
            width: '18px', 
            height: '18px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '12px'
          }}>✓</span> 
          Registered
        </button>
      );
    }

    // Case 2: Agar hackathon DRAFT mein hai (Yeh fix hai!)
    if (isDraft) {
      return (
        <button 
          className="btn-primary" 
          disabled 
          style={{ 
            flex: 1, 
            background: '#f1f5f9', 
            color: '#94a3b8', 
            border: '1px solid #e2e8f0', 
            cursor: 'not-allowed' 
          }}
        >
          Coming Soon
        </button>
      );
    }

    // Case 3: Agar registration band ho gayi hai
    if (isOngoing || isClosed) {
      return (
        <button 
          className="btn-primary" 
          disabled 
          style={{ 
            flex: 1, 
            background: '#f1f5f9', 
            color: '#94a3b8', 
            border: '1px solid #e2e8f0', 
            cursor: 'not-allowed' 
          }}
        >
          {isOngoing ? "Ongoing" : "Closed"}
        </button>
      );
    }

    // Default: Registration Open
    return (
      <button 
        className="btn-primary" 
        onClick={onRegister}
        style={{ flex: 1 }}
      >
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
          {hackathon.tags && hackathon.tags.map((tag) => (
            <span key={tag} className={`tag tag-${tag}`}>
              {tag}
            </span>
          ))}
        </div>

        <div className="info-grid">
          <div className="info-item"><span>👥</span> Team Size: {hackathon.teamSize}</div>
          <div className="info-item"><span>📍</span> Mode: {hackathon.mode}</div>
          <div className="info-item"><span>📅</span> Deadline: {hackathon.deadline}</div>
          <div className="info-item"><span>🏆</span> Prize Pool: {hackathon.prizePool}</div>
        </div>
      </div>

      <div className="card-actions" style={{ display: 'flex', gap: '12px', padding: '20px' }}>
        {renderMainButton()}
        <button 
          className="btn-secondary" 
          onClick={onViewDetails}
          style={{ flex: 1 }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default HackathonCard;