const HackathonsTab = ({ hackathons, navigate }) => {
  if (!hackathons || hackathons.length === 0) {
    return (
      <div className="hackathons-table-wrapper">
        <div className="empty-state">
          <p>You haven't participated in any hackathons yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hackathons-table-wrapper">
      <table className="hackathons-table">
        <thead>
          <tr>
            <th>Hackathon Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Result</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {hackathons.map((h) => (
            <tr key={h._id}>
              <td
                className="name-cell"
                onClick={() => navigate(`/user/hackathon/${h._id}`)}
              >
                {h.title}
              </td>
              <td>{h.role}</td>
              <td>
                <span
                  className={`status-badge ${h.status === "In Progress"
                      ? "status-badge--in-progress"
                      : h.status === "Completed"
                        ? "status-badge--completed"
                        : "status-badge--registered"
                    }`}
                >
                  {h.status}
                </span>
              </td>
              <td>{h.result || "-"}</td>
              <td>
                <a
                  className="action-icon"
                  onClick={() => navigate(`/user/hackathon/${h._id}`)}
                  title="View hackathon"
                >
                  ↗
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HackathonsTab;