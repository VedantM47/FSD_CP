function HackathonCard({ title, status, dateRange, organizer }) {
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'live': return 'status-live';
      case 'draft': return 'status-draft';
      case 'closed': return 'status-closed';
      default: return 'status-default';
    }
  };

  return (
    <div className="hackathon-card">
      <div className="hackathon-info">
        <div className="hackathon-header">
          <h3 className="hackathon-title">{title}</h3>
          <span className={`status-badge ${getStatusClass(status)}`}>{status}</span>
        </div>
        <div className="hackathon-meta">
          <span className="hackathon-date">{dateRange}</span>
          <span className="hackathon-divider">|</span>
          <span className="hackathon-organizer">Organizer: {organizer}</span>
        </div>
      </div>
      <div className="hackathon-actions">
        <button className="action-btn btn-view">View</button>
        <button className="action-btn btn-dashboard">Dashboard</button>
        <button className="action-btn btn-edit">Edit</button>
      </div>
    </div>
  );
}

export default HackathonCard;