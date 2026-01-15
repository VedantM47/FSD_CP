import React from "react";
import Navbar from "../../components/judge/Navbar";
import Footer from "../../components/judge/Footer";
import HackathonCard from "../../components/judge/HackathonCard";
import "../../styles/judge.css";

const AssignedHackathons = () => {
  const hackathons = [
    {
      id: 1,
      title: "AI Innovation Challenge 2026",
      status: "In Progress",
      round: "Final Round",
      timeline: "Jan 10, 2026 - Feb 15, 2026",
      deadline: "Feb 20, 2026",
      evaluated: 12,
      total: 45,
    },
    {
      id: 2,
      title: "Green Tech Hackathon",
      status: "Pending",
      round: "Round 2",
      timeline: "Feb 1, 2026 - Mar 1, 2026",
      deadline: "Mar 5, 2026",
      evaluated: 0,
      total: 32,
    },
    {
      id: 3,
      title: "FinTech Innovation Summit",
      status: "Completed",
      round: "Final Round",
      timeline: "Dec 1, 2025 - Dec 20, 2025",
      deadline: "Dec 25, 2025",
      evaluated: 28,
      total: 28,
    },
  ];

  return (
    <div className="judge-page">
      <Navbar />

      <main className="page-main">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Assigned Hackathons</h1>
            <p className="page-subtitle">
              Review and evaluate team submissions for hackathons you are
              judging.
            </p>
          </div>

          <div className="hackathon-grid">
            {hackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AssignedHackathons;
