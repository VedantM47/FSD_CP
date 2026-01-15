import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/judge/Navbar";
import Footer from "../../components/judge/Footer";
import "../../styles/judge.css";

const HackathonOverview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <div className="judge-page">
      <Navbar />

      <main className="page-main">
        <div className="page-container overview-container">
          <div className="overview-card">
            <div className="overview-header">
              <h1 className="overview-title">AI Innovation Challenge 2026</h1>
              <span className="status-badge status-in-progress">
                In Progress
              </span>
            </div>

            <p className="overview-round">Final Round</p>

            <p className="overview-description">
              A premier hackathon focused on developing innovative AI solutions
              for real-world problems. Participants will create cutting-edge
              applications using machine learning, natural language processing,
              and computer vision.
            </p>

            <div className="overview-info-grid">
              <div className="overview-info-item">
                <div className="info-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                    />
                    <path
                      d="M10 6V10L13 13"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="info-text">
                  <p className="info-text-label">Timeline</p>
                  <p className="info-text-value">Jan 10, 2026 - Feb 15, 2026</p>
                </div>
              </div>

              <div className="overview-info-item">
                <div className="info-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 2H4C2.89543 2 2 2.89543 2 4V16C2 17.1046 2.89543 18 4 18H16C17.1046 18 18 17.1046 18 16V4C18 2.89543 17.1046 2 16 2Z"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                    />
                    <path
                      d="M6 1V3M14 1V3M2 7H18"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="info-text">
                  <p className="info-text-label">Judging Deadline</p>
                  <p className="info-text-value">Feb 20, 2026</p>
                </div>
              </div>

              <div className="overview-info-item">
                <div className="info-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 19C17.2091 19 19 17.2091 19 15C19 12.7909 17.2091 11 15 11C12.7909 11 11 12.7909 11 15C11 17.2091 12.7909 19 15 19Z"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                    />
                    <path
                      d="M5 19C7.20914 19 9 17.2091 9 15C9 12.7909 7.20914 11 5 11C2.79086 11 1 12.7909 1 15C1 17.2091 2.79086 19 5 19Z"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                    />
                    <path
                      d="M10 5C12.2091 5 14 3.20914 14 1C14 -1.20914 12.2091 -3 10 -3C7.79086 -3 6 -1.20914 6 1C6 3.20914 7.79086 5 10 5Z"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                    />
                    <path
                      d="M10 5V11M5 11V8M15 11V8"
                      stroke="#4F9CF9"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="info-text">
                  <p className="info-text-label">Evaluation Progress</p>
                  <p className="info-text-value">12 / 45 teams</p>
                </div>
              </div>
            </div>

            <button
              className="btn-primary btn-large"
              onClick={() => navigate(`/judge/hackathons/${id}/submissions`)}
            >
              View Teams & Submissions
            </button>
          </div>

          <div className="deadline-card">
            <h3 className="deadline-title">Submission Deadline</h3>
            <p className="deadline-text">
              Teams must submit their projects by <strong>Feb 15, 2026</strong>.
              You can begin evaluating submissions as they come in.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HackathonOverview;
