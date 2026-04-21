import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/judge.css";
import "../../styles/judge-additional.css";

const HackathonCard = ({ hackathon }) => {
  const navigate = useNavigate();

  const getStatusClass = (status) => {
    switch (status) {
      case "In Progress": return "status-in-progress";
      case "Pending":     return "status-pending";
      case "Completed":   return "status-completed";
      default:            return "status-draft";
    }
  };

  const progressPercent =
    hackathon.total > 0
      ? Math.round((hackathon.evaluated / hackathon.total) * 100)
      : 0;

  return (
    <div className="hackathon-card">
      <div className="card-header">
        <h3 className="card-title">{hackathon.title}</h3>
        <span className={`status-badge ${getStatusClass(hackathon.status)}`}>
          {hackathon.status}
        </span>
      </div>

      <div className="card-content">
        <div className="card-info-row">
          <span className="info-label">Round</span>
          <span className="info-value">{hackathon.round}</span>
        </div>

        <div className="card-info-row">
          <span className="info-label">Timeline</span>
          <span className="info-value">{hackathon.timeline}</span>
        </div>

        <div className="card-info-row">
          <span className="info-label">Judging Deadline</span>
          <span className="info-value">{hackathon.deadline}</span>
        </div>
      </div>

      {/* Evaluation Progress Bar */}
      <div className="progress-bar-wrapper">
        <div className="progress-bar-label">
          <span>Evaluation Progress</span>
          <span>
            {hackathon.evaluated} / {hackathon.total} teams&nbsp;
            <span style={{ color: "var(--jdg-primary)", fontWeight: 700 }}>
              ({progressPercent}%)
            </span>
          </span>
        </div>
        <div className="progress-bar-track" role="progressbar"
          aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}
          aria-label="Evaluation progress">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="card-footer">
        <button
          className="btn-primary"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/judge/hackathons/${hackathon.id}`);
          }}
        >
          View Hackathon
        </button>
      </div>
    </div>
  );
};

export default HackathonCard;
