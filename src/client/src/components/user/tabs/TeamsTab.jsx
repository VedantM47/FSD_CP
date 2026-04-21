const TeamsTab = ({ teams, navigate }) => {
  if (!teams || teams.length === 0) {
    return (
      <div className="hackathons-table-wrapper">
        <div className="empty-state">
          <p>You're not part of any teams yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teams-grid">
      {teams.map((team) => (
        <div key={team._id} className="team-card">
          <div className="team-card__header">
            <h3 className="team-card__name">
              {team.name}
            </h3>

            {team.isLeader && (
              <span className="leader-badge">★ Leader</span>
            )}
          </div>

          <p className="team-card__hackathon">{team.hackathonName}</p>

          <div className="team-card__footer">
            <div className="team-card__meta">
              <span className="members-count">
                Members: <span>{team.membersCount}</span>
              </span>
              <span
                className={`team-card__status ${team.status === "Active"
                    ? "team-card__status--active"
                    : "team-card__status--completed"
                  }`}
              >
                {team.status}
              </span>
            </div>

            {team.hackathonId && (
              <a
                className="team-card__view-link"
                onClick={() =>
                  navigate(`/user/hackathon/${team.hackathonId}`)
                }
              >
                View Team
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamsTab;