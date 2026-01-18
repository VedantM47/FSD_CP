import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTeams } from '../../data/mockTeams'; // Import mock data
import '../../styles/JoinTeam.css';

const JoinTeam = () => {
  const navigate = useNavigate();
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');

  // Get unique domains for the dropdown
  const allDomains = ['All Domains', ...new Set(mockTeams.map(team => team.domain))];

  // Filtering Logic
  const filteredTeams = mockTeams.filter(team => {
    const matchesSearch = 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.lookingFor.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDomain = selectedDomain === 'All Domains' || team.domain === selectedDomain;

    return matchesSearch && matchesDomain;
  });

  const handleApply = (teamName) => {
    alert(`Application sent to ${teamName}! (This will be connected to backend later)`);
    // Logic: Post request to backend -> redirect to SingleHackathon with "Pending" status
  };

  return (
    <div className="join-team-wrapper">
      
      {/* HEADER */}
      <div className="join-header">
        <div className="join-header-content">
          <button className="back-link" onClick={() => navigate(-1)}>
            <span>←</span> Back to Details
          </button>
          <h1 className="join-title">Join a Team</h1>
          <p className="join-subtitle">Find the perfect team for AI Innovation Challenge 2026</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-section">
        <div className="search-box">
          <span style={{fontSize: '1.2rem'}}>🔍</span>
          <input 
            type="text" 
            className="search-input"
            placeholder="Search teams by name, skills, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span style={{color: '#D1D5DB'}}>|</span>
          <select 
            className="filter-select"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
          >
            {allDomains.map((domain, index) => (
              <option key={index} value={domain}>{domain}</option>
            ))}
          </select>
        </div>
        <p className="result-count">{filteredTeams.length} teams looking for members</p>
      </div>

      {/* TEAMS LIST */}
      <div className="teams-container">
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team) => (
            <div key={team.id} className="team-card">
              
              {/* Top Row: Name & Domain */}
              <div className="card-top">
                <h3 className="team-name">{team.name}</h3>
                <span className="domain-badge">{team.domain}</span>
              </div>

              {/* Meta Info */}
              <div className="card-meta">
                <div className="meta-item">
                  <span>👤</span> Led by {team.leader}
                </div>
                <div className="meta-item">
                  <span>👥</span> {team.currentMembers}/{team.maxMembers} members
                </div>
              </div>

              {/* Description */}
              <p className="team-desc">{team.description}</p>

              {/* Bottom Row: Roles & Apply Button */}
              <div className="card-bottom">
                <div className="roles-wrapper">
                  <span className="looking-label">💼 Looking for:</span>
                  <div className="role-tags">
                    {team.lookingFor.map((role, idx) => (
                      <span key={idx} className="role-tag">{role}</span>
                    ))}
                  </div>
                </div>
                <button 
                  className="btn-apply"
                  onClick={() => handleApply(team.name)}
                >
                  Apply to Join
                </button>
              </div>

            </div>
          ))
        ) : (
          <div style={{textAlign: 'center', padding: '40px', color: '#6B7280'}}>
            <h3>No teams found matching your search.</h3>
            <p>Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default JoinTeam;