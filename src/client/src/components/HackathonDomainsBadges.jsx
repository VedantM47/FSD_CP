import "../styles/HackathonDomainsBadges.css";

export function HackathonDomainsBadges({ domains = [], size = "medium" }) {
  if (!domains || domains.length === 0) {
    return <div className="domains-badges empty">No domains specified</div>;
  }

  return (
    <div className={`domains-badges ${size}`}>
      {domains.map((domain) => (
        <div key={domain.id} className="domain-badge">
          <span className="badge-icon">{domain.icon || "🏷️"}</span>
          <span className="badge-text">{domain.name}</span>
          {domain.description && (
            <div className="badge-tooltip">{domain.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
