import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/judge.css";

const HackathonCard = ({ hackathon }) => {
  const navigate = useNavigate();
  const getStatusClass = (status) => {
    switch (status) {
      case "In Progress":
        return "status-in-progress";
      case "Pending":
        return "status-pending";
      case "Completed":
        return "status-completed";
      default:
        return "";
    }
  };

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
          <span className="info-label">Round:</span>
          <span className="info-value">{hackathon.round}</span>
        </div>

        <div className="card-info-row">
          <span className="info-label">Timeline:</span>
          <span className="info-value">{hackathon.timeline}</span>
        </div>

        <div className="card-info-row">
          <span className="info-label">Judging Deadline:</span>
          <span className="info-value">{hackathon.deadline}</span>
        </div>

        <div className="card-info-row">
          <span className="info-label">Evaluation Progress:</span>
          <span className="info-value">
            {hackathon.evaluated} / {hackathon.total} teams
          </span>
        </div>
      </div>

      <div className="card-footer">
        <button
          className="btn-primary"
          onClick={(e) => {
            e.preventDefault();
            console.log("Navigating to:", `/judge/hackathons/${hackathon.id}`);
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
