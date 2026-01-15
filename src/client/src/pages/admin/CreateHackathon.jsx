// src/pages/admin/CreateHackathon.jsx
import { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useNavigate, useParams } from 'react-router-dom';
import mockHackathon from '../../data/mockHackathon';
import '../../styles/admin.css';

function CreateHackathon() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organization: '',
    location: '',
    status: 'Draft',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxTeamSize: '',
    minTeamSize: '',
    prizePool: '',
    rules: '',
    terms: '',
    problemStatement: ''
  });

  const [rounds, setRounds] = useState([{ id: 1, name: '', description: '', startDate: '', endDate: '' }]);
  const [judges, setJudges] = useState([{ id: 1, name: '', role: '' }]);

  // Load data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      // In production, fetch from API using id
      // For now, load mock data
      const data = mockHackathon;
      setFormData({
        name: data.name,
        description: data.description,
        organization: data.organization,
        location: data.location,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        registrationDeadline: data.registrationDeadline,
        maxTeamSize: data.maxTeamSize,
        minTeamSize: data.minTeamSize,
        prizePool: data.prizePool,
        rules: data.rules,
        terms: data.terms,
        problemStatement: data.problemStatement
      });
      setRounds(data.rounds.map(r => ({ ...r })));
      setJudges(data.judges.map(j => ({ ...j })));
    }
  }, [isEditMode, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoundChange = (index, field, value) => {
    const updated = [...rounds];
    updated[index][field] = value;
    setRounds(updated);
  };

  const handleJudgeChange = (index, field, value) => {
    const updated = [...judges];
    updated[index][field] = value;
    setJudges(updated);
  };

  const addRound = () => {
    setRounds([...rounds, { id: rounds.length + 1, name: '', description: '', startDate: '', endDate: '' }]);
  };

  const addJudge = () => {
    setJudges([...judges, { id: judges.length + 1, name: '', role: '' }]);
  };

  const handleSubmit = (isDraft = false) => {
    // Here you would send data to backend
    console.log('Submitting:', { formData, rounds, judges, isDraft });
    alert(isEditMode ? 'Hackathon updated successfully!' : 'Hackathon created successfully!');
    navigate('/admin/dashboard');
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
            <h1 className="page-title">{isEditMode ? 'Edit Hackathon' : 'Create Hackathon'}</h1>
          </div>

          <div className="info-banner">
            <svg className="info-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="10" cy="6" r="1" fill="currentColor"/>
            </svg>
            <span>
              {isEditMode 
                ? 'Editing this hackathon will update details visible to participants and judges.'
                : 'Setting up a hackathon lets teams, judges, and participants collaborate.'}
            </span>
          </div>

          <div className="hackathon-form">
            <section className="form-section">
              <h2 className="form-section-title">Hackathon Details</h2>
              
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-input" 
                  placeholder="Enter hackathon name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  name="description"
                  className="form-textarea" 
                  rows="4" 
                  placeholder="Describe your hackathon"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Organization</label>
                  <input 
                    type="text" 
                    name="organization"
                    className="form-input" 
                    placeholder="Organization name"
                    value={formData.organization}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input 
                    type="text" 
                    name="location"
                    className="form-input" 
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option>Draft</option>
                  <option>Live</option>
                  <option>Closed</option>
                </select>
              </div>
            </section>

            <section className="form-section">
              <h2 className="form-section-title">Dates & Rules</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date" 
                    name="startDate"
                    className="form-input"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input 
                    type="date" 
                    name="endDate"
                    className="form-input"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Registration Deadline</label>
                <input 
                  type="date" 
                  name="registrationDeadline"
                  className="form-input"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Maximum Team Size</label>
                  <input 
                    type="number" 
                    name="maxTeamSize"
                    className="form-input" 
                    placeholder="5"
                    value={formData.maxTeamSize}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum Team Size</label>
                  <input 
                    type="number" 
                    name="minTeamSize"
                    className="form-input" 
                    placeholder="2"
                    value={formData.minTeamSize}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2 className="form-section-title">Rules & Rewards</h2>

              <div className="form-group">
                <label className="form-label">Prize Pool</label>
                <input 
                  type="text" 
                  name="prizePool"
                  className="form-input" 
                  placeholder="₹1,00,000"
                  value={formData.prizePool}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rules</label>
                <textarea 
                  name="rules"
                  className="form-textarea" 
                  rows="4"
                  value={formData.rules}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Terms & Conditions</label>
                <textarea 
                  name="terms"
                  className="form-textarea" 
                  rows="4"
                  value={formData.terms}
                  onChange={handleInputChange}
                />
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
                      value={round.name}
                      onChange={(e) => handleRoundChange(index, 'name', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-textarea" 
                      rows="3" 
                      placeholder="Round description"
                      value={round.description}
                      onChange={(e) => handleRoundChange(index, 'description', e.target.value)}
                    ></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={round.startDate}
                        onChange={(e) => handleRoundChange(index, 'startDate', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={round.endDate}
                        onChange={(e) => handleRoundChange(index, 'endDate', e.target.value)}
                      />
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
                      value={judge.name}
                      onChange={(e) => handleJudgeChange(index, 'name', e.target.value)}
                    />
                    <input 
                      type="text" 
                      className="form-input judge-input" 
                      placeholder="Role"
                      value={judge.role}
                      onChange={(e) => handleJudgeChange(index, 'role', e.target.value)}
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
                  name="problemStatement"
                  className="form-textarea" 
                  rows="5" 
                  placeholder="Describe the problem statement"
                  value={formData.problemStatement}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </section>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => handleSubmit(true)}
              >
                Save Draft
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => handleSubmit(false)}
              >
                {isEditMode ? 'Update Hackathon' : 'Publish Hackathon'}
              </button>
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