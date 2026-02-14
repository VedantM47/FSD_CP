import React from 'react';

const HackathonCard = ({ hackathon }) => {
    return (
        <div className="hackathon-card">
            <div className="card-image-container">
                <img src={hackathon.image} alt={hackathon.name} className="card-image" />
                <span className="status-badge">{hackathon.status}</span>
            </div>

            <div className="card-content">
                <h3 className="card-title">{hackathon.name}</h3>
                <p className="card-org">by {hackathon.organization}</p>
                <p className="card-description">{hackathon.description}</p>

                <div className="tag-container">
                    {hackathon.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                    ))}
                </div>

                <div className="info-grid">
                    <div className="info-item">
                        <span>👥</span> Team Size: {hackathon.teamSize}
                    </div>
                    <div className="info-item">
                        <span>📍</span> Mode: {hackathon.mode}
                    </div>
                    <div className="info-item">
                        <span>📅</span> Deadline: {hackathon.deadline}
                    </div>
                    <div className="info-item">
                        <span>🏆</span> Prize Pool: {hackathon.prizePool}
                    </div>
                </div>
            </div>

            <div className="card-actions">
                <button className="btn-primary">Register Now</button>
                <button className="btn-secondary">View Details</button>
            </div>
        </div>
    );
};

export default HackathonCard;
