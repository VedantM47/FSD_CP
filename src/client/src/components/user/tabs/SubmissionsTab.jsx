const SubmissionsTab = ({ submissions }) => {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="submissions-table-wrapper">
        <div className="empty-state">
          <p>No submissions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="submissions-table-wrapper">
      <table className="submissions-table">
        <thead>
          <tr>
            <th>Hackathon</th>
            <th>Round</th>
            <th>Submission Link</th>
            <th>Score</th>
            <th>Feedback Status</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s._id}>
              <td className="hack-name">{s.hackathonName}</td>
              <td>{s.round}</td>
              <td>
                {s.link ? (
                  <a
                    href={s.link.startsWith("http") ? s.link : `https://${s.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="submission-link"
                  >
                    {s.link.replace(/^https?:\/\//, "").slice(0, 35)}
                    {s.link.length > 35 ? "..." : ""} ↗
                  </a>
                ) : (
                  <span style={{ color: "#94a3b8" }}>—</span>
                )}
              </td>
              <td className="score-cell">{s.score}</td>
              <td>
                <span
                  className={`feedback-badge ${s.feedbackStatus === "available"
                      ? "feedback-badge--available"
                      : "feedback-badge--pending"
                    }`}
                >
                  <span
                    className={`feedback-icon ${s.feedbackStatus === "available"
                        ? "feedback-icon--available"
                        : "feedback-icon--pending"
                      }`}
                  >
                    {s.feedbackStatus === "available" ? "✓" : "⏳"}
                  </span>
                  {s.feedbackStatus === "available" ? "Available" : "Pending"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionsTab;