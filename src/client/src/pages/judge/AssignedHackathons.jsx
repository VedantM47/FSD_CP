import React, { useState, useEffect } from "react";
import Navbar from "../../components/judge/Navbar";
import Footer from "../../components/judge/Footer";
import HackathonCard from "../../components/judge/HackathonCard";
import judgeApi from "../../services/judgeApi";
import "../../styles/judge.css";
import "../../styles/judge-additional.css";

const AssignedHackathons = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchAssignedHackathons();
  }, []);

  const fetchAssignedHackathons = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get current user
      const userData = await judgeApi.getMe();
      setUser(userData.data);
      const currentUserId = String(userData.data._id);

      // 2. Get all hackathons
      const response = await judgeApi.getAssignedHackathons();

      if (response.success) {
        // --- THE FIX IS HERE ---
        // Filter hackathons by checking if this user's ID is inside the hackathon's judges array
        const assignedHackathons = response.data.filter((hackathon) => {
          if (!hackathon.judges || !Array.isArray(hackathon.judges))
            return false;

          return hackathon.judges.some(
            (judge) => String(judge.judgeUserId) === currentUserId,
          );
        });

        // 3. Fetch additional data for each hackathon
        const enrichedHackathons = await Promise.all(
          assignedHackathons.map(async (hackathon) => {
            try {
              // Get teams for this hackathon
              const teamsResponse = await judgeApi.getTeamsByHackathon(
                hackathon._id,
              );
              // FIX: prefer the server-returned `count` field; fall back to array length;
              // guard against null/failed response so total never shows as undefined.
              const teams = teamsResponse.data || [];
              const resolvedTeamsCount = teamsResponse.count ?? teams.length;

              // Get overview data (if admin endpoint is accessible)
              let overview = {
                teamsCount: resolvedTeamsCount,
                submissionsCount: 0,
              };
              try {
                const overviewResponse = await judgeApi.getHackathonOverview(
                  hackathon._id,
                );
                if (overviewResponse.success) {
                  overview = {
                    ...overviewResponse.data,
                    // Always keep a valid teamsCount even if admin overview omits it
                    teamsCount:
                      overviewResponse.data?.teamsCount ?? resolvedTeamsCount,
                  };
                }
              } catch (err) {
                console.log("Overview not available, using team count");
              }

              // Count teams this judge has already evaluated — run in parallel
              const evaluationResults = await Promise.all(
                teams.map(async (team) => {
                  try {
                    const evalResponse = await judgeApi.getEvaluationsByTeam(
                      hackathon._id,
                      team._id,
                    );
                    if (evalResponse.success && evalResponse.count > 0) {
                      return evalResponse.data.some(
                        (evaluation) =>
                          String(evaluation.judgeId) === currentUserId,
                      );
                    }
                  } catch {
                    // If evaluation fetch fails for a team, treat as not evaluated
                  }
                  return false;
                }),
              );
              const evaluatedCount = evaluationResults.filter(Boolean).length;

              return {
                id: hackathon._id,
                title: hackathon.title,
                status: getHackathonStatus(hackathon),
                round: "Final Round", // You can make this dynamic based on your logic
                timeline: formatTimeline(
                  hackathon.startDate,
                  hackathon.endDate,
                ),
                deadline: formatDeadline(hackathon.endDate),
                evaluated: evaluatedCount,
                total: overview.teamsCount,
                rawData: hackathon,
              };
            } catch (err) {
              console.error("Error enriching hackathon:", err);
              return {
                id: hackathon._id,
                title: hackathon.title,
                status: getHackathonStatus(hackathon),
                round: "Final Round",
                timeline: formatTimeline(
                  hackathon.startDate,
                  hackathon.endDate,
                ),
                deadline: formatDeadline(hackathon.endDate),
                evaluated: 0,
                total: 0,
                rawData: hackathon,
              };
            }
          }),
        );

        setHackathons(enrichedHackathons);
      }
    } catch (err) {
      console.error("Error fetching hackathons:", err);
      setError(err.message || "Failed to load assigned hackathons");
    } finally {
      setLoading(false);
    }
  };

  const getHackathonStatus = (hackathon) => {
    switch (hackathon.status) {
      case "ongoing":
        return "In Progress";
      case "open":
        return "Pending";
      case "closed":
        return "Completed";
      case "draft":
        return "Draft";
      default:
        return "Unknown";
    }
  };

  const formatTimeline = (startDate, endDate) => {
    if (!startDate || !endDate) return "N/A";
    const start = new Date(startDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return `${start} - ${end}`;
  };

  const formatDeadline = (endDate) => {
    if (!endDate) return "N/A";
    return new Date(endDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="judge-page">
        <Navbar />
        <main className="page-main">
          <div className="page-container">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading assigned hackathons...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="judge-page">
        <Navbar />
        <main className="page-main">
          <div className="page-container">
            <div className="error-container">
              <h2>Error Loading Hackathons</h2>
              <p>{error}</p>
              <button className="btn-primary" onClick={fetchAssignedHackathons}>
                Retry
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

          {hackathons.length === 0 ? (
            <div className="empty-state">
              <p>No hackathons assigned to you yet.</p>
            </div>
          ) : (
            <div className="hackathon-grid">
              {hackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AssignedHackathons;
