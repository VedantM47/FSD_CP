import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/judge/Footer";
import { HackathonDomainsBadges } from "../../components/HackathonDomainsBadges";
import API, { getAuthHeaders, getHackathonById } from "../../services/api";
import "../../styles/SingleHackathon.css";
import Navbar from "../../components/common/Navbar";

const SingleHackathon = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- 1. FULL STATE MANAGEMENT ---
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("About");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isPendingRegistration, setIsPendingRegistration] = useState(false);
  const [isInvitedPending, setIsInvitedPending] = useState(false);
  const [isJudge, setIsJudge] = useState(false);
  const [userTeam, setUserTeam] = useState(null);
  const [openTeams, setOpenTeams] = useState([]);
  const [loadingOpenTeams, setLoadingOpenTeams] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // --- 2. FETCH DATA & AUTH SYNC ---
  useEffect(() => {
    const fetchHackathonData = async () => {
      try {
        setLoading(true);

        // Fetch hackathon details (now includes minTeamSize and maxTeamSize)
        const response = await getHackathonById(id);
        const hackData = response.data?.data || response.data;
        setHackathon(hackData);

        const userRes = await API.get("/users/me", getAuthHeaders());
        const userData = userRes.data?.data || userRes.data;

        if (userData) {
          const judgeRole = userData.hackathonRoles?.some(
            (role) =>
              String(role.hackathonId) === String(id) && role.role === "judge",
          );
          setIsJudge(judgeRole);

          const participantRole = userData.hackathonRoles?.some(
            (role) =>
              String(role.hackathonId) === String(id) &&
              role.role === "participant",
          );

          let teamDetails = null;
          try {
            const teamsRes = await API.get(
              `/hackathons/${id}/teams`,
              getAuthHeaders(),
            );
            const allTeams = teamsRes.data?.data || [];
            teamDetails = allTeams.find((team) =>
              team.members.some(
                (m) =>
                  String(m.userId?._id || m.userId) ===
                  String(userData?._id || userData),
              ),
            );

            const currentMember = teamDetails?.members?.find(
              (m) =>
                String(m.userId?._id || m.userId) ===
                String(userData?._id || userData),
            );
            const memberStatus = currentMember?.status;

            // Only 'pending' join requests block registration, not invites
            setIsPendingRegistration(memberStatus === "pending");

            // If user has 'invited' status, they are NOT a full accepted member
            // Leader check: if user is the leader of the team, they are accepted
            const isLeaderOfTeam =
              teamDetails &&
              String(teamDetails.leader?._id || teamDetails.leader) ===
                String(userData._id);
            const isAccepted = isLeaderOfTeam || memberStatus === "accepted";

            // Store unaccepted status for blocking dashboard
            setIsInvitedPending(memberStatus === "invited");
            setIsPendingRegistration(
              memberStatus === "pending" || memberStatus === "invited",
            );

            if (!isAccepted && !memberStatus) {
              // Not actually in a team — reset teamDetails
              teamDetails = null;
            }
          } catch (teamErr) {
            console.error("Team sync lookup failed.", teamErr);
          }

          setIsRegistered(participantRole || !!teamDetails);
          setUserTeam(teamDetails);
        }
      } catch (err) {
        setError("Error loading hackathon details. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchHackathonData();
  }, [id]);

  // Fetch Open Teams if not registered
  useEffect(() => {
    const fetchOpenTeams = async () => {
      if (isRegistered || !id) return;
      try {
        setLoadingOpenTeams(true);
        const { getHackathonTeams } = await import("../../services/api");
        const { data } = await getHackathonTeams(id);
        if (data.success) {
          const open = data.data.filter((t) => t.isOpenToJoin).slice(0, 3);
          setOpenTeams(open);
        }
      } catch (err) {
        console.error("Failed to fetch open teams", err);
      } finally {
        setLoadingOpenTeams(false);
      }
    };
    fetchOpenTeams();
  }, [id, isRegistered]);

  // --- 3. COUNTDOWN TIMER LOGIC ---
  useEffect(() => {
    if (!hackathon?.endDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(hackathon.endDate) - new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [hackathon]);

  const scrollToSection = (sectionId) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const formatDate = (date) => {
    return date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "TBD";
  };

  if (loading)
    return (
      <div className="sh-loading">
        <h2>Initializing Portal...</h2>
      </div>
    );
  if (error)
    return (
      <div className="sh-error">
        <h2>{error}</h2>
      </div>
    );
  if (!hackathon) return null;

  // --- DYNAMIC LOGIC HELPERS ---
  const isOngoing = hackathon.status === "ongoing";
  const isRegistrationOpen =
    hackathon.status === "open" &&
    (!hackathon.registrationDeadline ||
      new Date() <= new Date(hackathon.registrationDeadline));
  const isSubmissionClosed = new Date() > new Date(hackathon.endDate);

  // Dynamic Team Size Logic
  const minRequired = hackathon.minTeamSize || 1;
  const maxAllowed = hackathon.maxTeamSize || 4;
  const acceptedMembers =
    userTeam?.members?.filter((m) => m.status === "accepted") || [];
  const meetsCriteria = acceptedMembers.length >= minRequired;

  return (
    <div className="sh-wrapper">
        
      <div className="sh-topbar">
        <button className="sh-back-btn" onClick={() => navigate(-1)}>
          {" "}
          &larr; Back{" "}
        </button>
      </div>

      <div className="sh-hero-container">
        <div className="sh-hero-card">
          <div className="sh-badges">
            <span
              className={`sh-badge status-${hackathon.status?.toLowerCase() || "default"}`}
            >
              {hackathon.status}
            </span>
            <span className="sh-badge mode">Online Event</span>
          </div>
          <h1 className="sh-title">{hackathon.title}</h1>
          <p className="sh-subtitle">
            Collaborate with developers and build the future.
          </p>
        </div>
      </div>

      <div className="sh-layout">
        <div className="sh-main">
          <div className="sh-tabs-container">
            {["About", "Domains", "Timeline", "Prizes", "Rules", "Teams"].map(
              (tab) => (
                <button
                  key={tab}
                  className={`sh-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => scrollToSection(tab)}
                >
                  {tab}
                </button>
              ),
            )}
          </div>

          <div id="About" className="sh-content-card">
            <h2 className="sh-card-title">About the Hackathon</h2>
            <div className="sh-card-content about-text">
              {hackathon.description}
            </div>
          </div>

          {hackathon.domains && hackathon.domains.length > 0 && (
            <div id="Domains" className="sh-content-card">
              <h2 className="sh-card-title">Problem Domains</h2>
              <div
                style={{
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                }}
              >
                <HackathonDomainsBadges
                  domains={hackathon.domains}
                  size="large"
                />
              </div>
            </div>
          )}

          <div id="Timeline" className="sh-content-card">
            <h2 className="sh-card-title">Timeline</h2>
            <div className="modern-timeline">
              <div className="timeline-step">
                <div className="timeline-indicator"></div>
                <div className="timeline-content">
                  <h4 className="timeline-date">
                    {formatDate(hackathon.registrationDeadline)}
                  </h4>
                  <p className="timeline-event">Registration Closes</p>
                </div>
              </div>
              <div className="timeline-step active">
                <div className="timeline-indicator"></div>
                <div className="timeline-content">
                  <h4 className="timeline-date">
                    {formatDate(hackathon.startDate)}
                  </h4>
                  <p className="timeline-event">Hacking Begins</p>
                </div>
              </div>
              <div className="timeline-step">
                <div className="timeline-indicator"></div>
                <div className="timeline-content">
                  <h4 className="timeline-date">
                    {formatDate(hackathon.endDate)}
                  </h4>
                  <p className="timeline-event">Submission Deadline</p>
                </div>
              </div>
            </div>
          </div>

          <div id="Prizes" className="sh-content-card">
            <h2 className="sh-card-title">Prizes & Rewards</h2>
            <div className="prize-banner">
              <div className="prize-icon">🏆</div>
              <div className="prize-details">
                <span className="prize-label">Total Prize Pool</span>
                <span className="prize-amount">
                  {hackathon.prizePool || "Coming Soon"}
                </span>
              </div>
            </div>
          </div>

          <div id="Rules" className="sh-content-card">
            <h2 className="sh-card-title">Rules & Eligibility</h2>
            <ul className="sh-rules-list">
              {hackathon.rules ? (
                hackathon.rules
                  .split(".")
                  .map(
                    (rule, i) => rule.trim() && <li key={i}>{rule.trim()}.</li>,
                  )
              ) : (
                <li>Standard platform rules apply.</li>
              )}
            </ul>
          </div>

          <div id="Teams" className="sh-content-card">
            <h2 className="sh-card-title">Open Teams</h2>
            <div className="sh-teams-grid">
              {loadingOpenTeams ? (
                <p>Loading teams...</p>
              ) : openTeams.length === 0 ? (
                <div className="sh-empty-teams">
                  <p>No open teams currently looking for members.</p>
                  <button
                    className="btn-secondary"
                    onClick={() => navigate(`/user/hackathon/${id}/register`)}
                  >
                    Create Your Own Team
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {openTeams.map((team) => (
                    <div
                      key={team._id}
                      className="sh-team-card-alt"
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "20px",
                        background: "#fff",
                      }}
                    >
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "1.2rem" }}>
                        {team.name}
                      </h4>
                      <p
                        style={{
                          margin: "0 0 16px 0",
                          fontSize: "0.9rem",
                          color: "#64748b",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {team.projectDescription || "Looking for teammates!"}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                          {team.members?.filter((m) => m.status === "accepted")
                            .length || 0}{" "}
                          Members
                        </span>
                        <button
                          className="btn-view-team"
                          onClick={() =>
                            navigate(`/user/hackathon/${id}/team/${team._id}`)
                          }
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              className="btn-link"
              style={{
                marginTop: "20px",
                color: "#2563eb",
                fontWeight: "700",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/user/hackathon/${id}/JoinTeam`)}
            >
              Browse All Teams in Discovery Mode →
            </button>
          </div>
        </div>

        <div className="sh-sidebar">
          <div className="sh-sidebar-card action-card">
            {isJudge ? (
              <div
                className="sh-judge-view"
                style={{ textAlign: "center", padding: "10px" }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
                  ⚖️
                </div>
                <h3 className="dashboard-title">Judge Panel</h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#64748B",
                    marginTop: "10px",
                  }}
                >
                  Evaluation portal is active for registered judges.
                </p>
                <button
                  className="btn-primary"
                  style={{ marginTop: "20px" }}
                  onClick={() => navigate("/judge/hackathons")}
                >
                  Go to Judge Panel
                </button>
              </div>
            ) : isRegistered ? (
              <div className="dashboard-view">
                <div className="dashboard-header">
                  {isPendingRegistration ? (
                    <div
                      className="registered-badge-pill"
                      style={{ background: "#FEF3C7", color: "#D97706" }}
                    >
                      <span
                        className="dot"
                        style={{ background: "#D97706" }}
                      ></span>
                      {isInvitedPending
                        ? "INVITE PENDING ACCEPTANCE"
                        : "PENDING APPROVAL"}
                    </div>
                  ) : (
                    <div className="registered-badge-pill">
                      <span className="dot"></span>REGISTERED
                    </div>
                  )}
                  <h3 className="dashboard-title">Your Dashboard</h3>
                </div>

                {!isPendingRegistration && (
                  <button
                    className="btn-primary"
                    style={{
                      width: "100%",
                      marginBottom: "1rem",
                      backgroundColor: "#0f172a",
                    }}
                    onClick={() => navigate(`/user/hackathon/${id}/dashboard`)}
                  >
                    🚀 Go To Full Dashboard
                  </button>
                )}

                <div className="countdown-section">
                  {meetsCriteria && isOngoing && !isSubmissionClosed ? (
                    <>
                      <p className="countdown-text">Time Left to Submit</p>
                      <div className="time-blocks">
                        <div className="time-block">
                          <span>
                            {timeLeft.days.toString().padStart(2, "0")}
                          </span>
                          <small>Days</small>
                        </div>
                        <div className="time-block">
                          <span>
                            {timeLeft.hours.toString().padStart(2, "0")}
                          </span>
                          <small>Hrs</small>
                        </div>
                        <div className="time-block">
                          <span>
                            {timeLeft.minutes.toString().padStart(2, "0")}
                          </span>
                          <small>Mins</small>
                        </div>
                        <div className="time-block">
                          <span>
                            {timeLeft.seconds.toString().padStart(2, "0")}
                          </span>
                          <small>Secs</small>
                        </div>
                      </div>
                    </>
                  ) : !meetsCriteria && !isSubmissionClosed ? (
                    /* DYNAMIC WARNING BOX */
                    <div
                      className="sh-warning-box"
                      style={{
                        padding: "15px",
                        background: "#FFFBEB",
                        borderRadius: "10px",
                        border: "1px solid #FDE68A",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: "#92400E",
                          fontWeight: "700",
                          fontSize: "0.85rem",
                        }}
                      >
                        ⚠️ Action Required
                      </p>
                      <p
                        style={{
                          margin: "5px 0 0",
                          color: "#B45309",
                          fontSize: "0.75rem",
                        }}
                      >
                        Need {minRequired} accepted members to submit. Current:{" "}
                        {acceptedMembers.length}.
                      </p>
                    </div>
                  ) : (
                    <p className="countdown-text">
                      {isSubmissionClosed
                        ? "Hackathon Ended"
                        : "Submissions not yet open"}
                    </p>
                  )}
                </div>

                {meetsCriteria && isOngoing && !isSubmissionClosed ? (
                  <button
                    className="btn-primary"
                    onClick={() => navigate(`/user/hackathon/${id}/submit`)}
                  >
                    Open Submission Portal
                  </button>
                ) : !isPendingRegistration ? (
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      navigate(`/user/hackathon/${id}/manage-team`)
                    }
                  >
                    Manage Team Members
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="join-view">
                <h3 className="dashboard-title">Registration</h3>
                {isRegistrationOpen ? (
                  <>
                    <div className="action-buttons">
                      <button
                        className="btn-primary"
                        onClick={() =>
                          navigate(`/user/hackathon/${id}/register`)
                        }
                      >
                        Register Now
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() =>
                          navigate(`/user/hackathon/${id}/JoinTeam`)
                        }
                      >
                        Join a Team
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    className="sh-closed-box"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
                      ⌛
                    </div>
                    <p
                      style={{ fontWeight: "800", color: "#64748B", margin: 0 }}
                    >
                      Registration Closed
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="sh-sidebar-card">
            <h3 className="sidebar-title">Requirements</h3>
            <div className="detail-row">
              <span className="detail-label">Team Size</span>
              {/* DISPLAY DYNAMIC RANGE */}
              <span className="detail-value">
                {minRequired} - {maxAllowed} Members
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span
                className="detail-value"
                style={{ textTransform: "capitalize" }}
              >
                {hackathon.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SingleHackathon;
