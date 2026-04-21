import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/judge/Footer';
import DiscussionPanel from '../../components/common/DiscussionPanel';
import { getHackathonById, getMe } from '../../services/api';
import '../../styles/discussion-page.css';

const DiscussionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [hackathon, setHackathon] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch hackathon details
        const hackRes = await getHackathonById(id);
        setHackathon(hackRes.data?.data || hackRes.data);

        // Fetch current user
        const userRes = await getMe();
        setCurrentUser(userRes.data?.data || userRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load discussion. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="discussion-page-wrapper">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading discussion...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="discussion-page-wrapper">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <button 
              className="back-button"
              onClick={() => navigate(-1)}
            >
              ← Go Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="discussion-page-wrapper">
        <div className="discussion-page-container">
          {/* Back Button & Header */}
          <div className="discussion-page-header">
            <button 
              className="back-button"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
            <div className="header-content">
              <h1>{hackathon?.name || 'Hackathon'}</h1>
              <p className="discussion-description">
                Join the discussion, ask questions, and connect with other participants
              </p>
            </div>
          </div>

          {/* Sidebar + Main Content */}
          <div className="discussion-page-layout">
            {/* Sidebar - Hackathon Info */}
            <aside className="discussion-sidebar">
              <div className="sidebar-card">
                <h3>About This Hackathon</h3>
                {hackathon?.banner && (
                  <img 
                    src={hackathon.banner} 
                    alt={hackathon.name}
                    className="sidebar-image"
                  />
                )}
                <div className="sidebar-info">
                  <div className="info-item">
                    <span className="label">Status</span>
                    <span className="value">{hackathon?.status || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Mode</span>
                    <span className="value">{hackathon?.mode || 'N/A'}</span>
                  </div>
                  {hackathon?.startDate && (
                    <div className="info-item">
                      <span className="label">Starts</span>
                      <span className="value">
                        {new Date(hackathon.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {hackathon?.endDate && (
                    <div className="info-item">
                      <span className="label">Ends</span>
                      <span className="value">
                        {new Date(hackathon.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="sidebar-card stats-card">
                <h3>Quick Stats</h3>
                <div className="stats-grid">
                  <div className="stat">
                    <div className="stat-value">
                      {hackathon?.teams?.length || '0'}
                    </div>
                    <div className="stat-label">Teams</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">
                      {hackathon?.maxParticipants || '∞'}
                    </div>
                    <div className="stat-label">Participants</div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Discussion Panel */}
            <main className="discussion-main">
              <DiscussionPanel 
                hackathonId={id}
                currentUser={currentUser}
              />
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DiscussionPage;
