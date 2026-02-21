import React from "react";

const HackathonCard = ({ hackathon, onRegister, onViewDetails }) => {
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
          {hackathon.tags.map((tag) => (
            <span key={tag} className={`tag tag-${tag}`}>
              {tag}
            </span>
          ))}
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span>👥</span> Team Size: {hackathon.teamSize}
          </div>
          <div className="info-item">
            <span>📍</span> Mode: {hackathon.mode}
          </div>
          <div className="info-item">
            <span>📅</span> Deadline: {hackathon.deadline}
          </div>
          <div className="info-item">
            <span>🏆</span> Prize Pool: {hackathon.prizePool}
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button
          className="btn-primary"
          disabled={
            hackathon.status === "closed" || hackathon.status === "draft"
          }
          onClick={onRegister}
        >
          {hackathon.status === "closed" ? "Closed" : "Register Now"}
        </button>
        <button className="btn-secondary" onClick={onViewDetails}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default HackathonCard;
