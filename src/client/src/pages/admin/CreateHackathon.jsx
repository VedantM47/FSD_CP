import { useState } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin.css';

function CreateHackathon() {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([{ id: 1 }]);
  const [judges, setJudges] = useState([{ id: 1 }]);

  const addRound = () => {
    setRounds([...rounds, { id: rounds.length + 1 }]);
  };

  const addJudge = () => {
    setJudges([...judges, { id: judges.length + 1 }]);
  };

  return (
    <div className="admin-layout">
      <AdminNavbar />
      
      <main className="admin-main">
        <div className="admin-container">
          <div className="page-header">
            <button 
              className="back-btn"
              onClick={() => navigate('/admin/dashboard')}
            >
              ← Back to Dashboard
            </button>
            <h1 className="page-title">Create Hackathon</h1>
          </div>

          <div className="info-banner">
            <svg className="info-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="10" cy="6" r="1" fill="currentColor"/>
            </svg>
            <span>Setting up a hackathon lets teams, judges, and participants collaborate.</span>
          </div>

          <div className="hackathon-form">
            <section className="form-section">
              <h2 className="form-section-title">Hackathon Details</h2>
              
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" placeholder="Enter hackathon name" />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows="4" placeholder="Describe your hackathon"></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Organization</label>
                  <input type="text" className="form-input" placeholder="Organization name" />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-input" placeholder="Location" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select">
                  <option>Draft</option>
                  <option>Published</option>
                  <option>Closed</option>
                </select>
              </div>
            </section>

            <section className="form-section">
              <h2 className="form-section-title">Dates & Rules</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Registration Deadline</label>
                <input type="date" className="form-input" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Maximum Team Size</label>
                  <input type="number" className="form-input" placeholder="5" />
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum Team Size</label>
                  <input type="number" className="form-input" placeholder="2" />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2 className="form-section-title">Rules & Rewards</h2>

              <div className="form-group">
                <label className="form-label">Prize Pool</label>
                <input type="text" className="form-input" placeholder="₹1,00,000" />
              </div>

              <div className="form-group">
                <label className="form-label">Rules</label>
                <textarea className="form-textarea" rows="4" />
              </div>

              <div className="form-group">
                <label className="form-label">Terms & Conditions</label>
                <textarea className="form-textarea" rows="4" />
              </div>
            </section>


            <section className="form-section">
              <h2 className="form-section-title">Rounds Configuration</h2>
              
              {rounds.map((round, index) => (
                <div className="round-card" key={round.id}>
                  <div className="form-group">
                    <label className="form-label">Round Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder={`Round ${index + 1}`} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-textarea" 
                      rows="3" 
                      placeholder="Round description"
                    ></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input type="date" className="form-input" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input type="date" className="form-input" />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="add-round-btn" onClick={addRound}>
                + Add Round
              </button>
            </section>

            <section className="form-section">
              <h2 className="form-section-title">Judges & Problem Statements</h2>
              
              <div className="form-group">
                <label className="form-label">Judges</label>
                {judges.map((judge, index) => (
                  <div className="judge-item" key={judge.id}>
                    <input 
                      type="text" 
                      className="form-input judge-input" 
                      placeholder={`Judge ${index + 1} name`} 
                    />
                    <input 
                      type="text" 
                      className="form-input judge-input" 
                      placeholder="Role" 
                    />
                  </div>
                ))}
              </div>

              <button type="button" className="add-judge-btn" onClick={addJudge}>
                + Add Judge
              </button>

              <div className="form-group problem-statement-group">
                <label className="form-label">Problem Statement</label>
                <textarea 
                  className="form-textarea" 
                  rows="5" 
                  placeholder="Describe the problem statement"
                ></textarea>
              </div>
            </section>

            <div className="form-actions">
              <button type="button" className="btn-secondary">Save Draft</button>
              <button type="button" className="btn-primary">Publish Hackathon</button>
            </div>
          </div>
        </div>
      </main>

      <footer className="admin-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-brand">HackPlatform</span>
          </div>
          <div className="footer-right">
            <a href="#about" className="footer-link">About</a>
            <a href="#faqs" className="footer-link">FAQs</a>
            <a href="#contact" className="footer-link">Contact</a>
            <a href="#terms" className="footer-link">Terms & Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CreateHackathon;