import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API, { getAuthHeaders, getHackathonById, getMe } from '../../services/api';
import Footer from '../../components/judge/Footer';
import '../../styles/SubmitProject.css';

const SubmitProject = () => {
  const navigate = useNavigate();
  const { id: hackathonId } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [hackathon, setHackathon] = useState(null);
  const [userTeamId, setUserTeamId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    track: '',
    description: '',
    pptLink: '',
    repoLink: '',
    demoLink: ''
  });

  useEffect(() => {
    const fetchContext = async () => {
      try {
        setLoading(true);
        
        // 1. Get Hackathon Details
        const hackRes = await getHackathonById(hackathonId);
        const hackData = hackRes.data?.data || hackRes.data;
        setHackathon(hackData);

        // 2. Immediate Status Check - If not ongoing, we stop here.
        if (hackData.status !== 'ongoing') {
            setLoading(false);
            return; 
        }

        // 3. Get Current User Data
        const userRes = await getMe();
        const userData = userRes.data?.data || userRes.data;

        // 4. Find the team where current user is the leader
        const teamsRes = await API.get(`/hackathons/${hackathonId}/teams`, getAuthHeaders());
        const teams = teamsRes.data?.data || teamsRes.data || [];
        
        const myTeam = teams.find(t => {
            const leaderId = t.leader?._id || t.leader;
            return String(leaderId) === String(userData._id);
        });

        if (myTeam) {
          setUserTeamId(myTeam._id);
        } else {
          setError("Access Denied: You must be the Team Leader to submit a project.");
        }

      } catch (err) {
        console.error("Submission Context Error:", err);
        setError("Failed to load submission requirements.");
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, [hackathonId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userTeamId) {
        setError("Missing Team Information. Only leaders can submit.");
        return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        hackathonId,
        teamId: userTeamId,
        title: formData.title,
        description: formData.description,
        pptLink: formData.pptLink,
        repoLink: formData.repoLink,
        demoLink: formData.demoLink,
        track: formData.track
      };

      const response = await API.post("/submissions", payload, getAuthHeaders());
      if (response.data?.success) {
        setSuccess(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Submission failed. Ensure hackathon status is 'ongoing'.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="sp-loading"><h2>Initializing Portal...</h2></div>;

  // --- LOCKED STATE UI ---
  // This prevents users from even seeing the form if the status is wrong
  if (hackathon && hackathon.status !== 'ongoing') {
    return (
      <div className="sp-wrapper">
        <div className="sp-container">
          <div className="sp-form-card locked-state">
            <div className="locked-icon">🔒</div>
            <h2 className="sp-section-title">Submission Portal Locked</h2>
            <p className="locked-msg">
              The hacking phase for <strong>{hackathon.title}</strong> has not started or has already ended.
              Submissions are only accepted when the status is <strong>'ongoing'</strong>.
            </p>
            <button className="sp-btn-secondary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="sp-wrapper">
        <div className="sp-success-container">
          <div className="sp-success-icon">🚀</div>
          <h1 className="sp-success-title">Submission Received</h1>
          <p className="sp-success-desc">
            Your project <strong>{formData.title}</strong> has been logged. Judges will review it shortly.
          </p>
          <button className="sp-btn-primary" onClick={() => navigate(`/user/hackathon/${hackathonId}`)}>
            Return to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="sp-wrapper">
      <div className="sp-header">
        <div className="sp-header-glow"></div>
        <div className="sp-header-content">
          <span className="sp-badge">Active Submission</span>
          <h1 className="sp-title">Submit {hackathon?.title}</h1>
        </div>
      </div>

      <div className="sp-container">
        <form className="sp-form-card" onSubmit={handleSubmit}>
          {error && <div className="sp-error-banner">{error}</div>}
          
          <div className="sp-form-section">
            <h3 className="sp-section-title">1. Project Overview</h3>
            <div className="sp-input-group">
              <label>Project Title <span className="req">*</span></label>
              <input type="text" name="title" onChange={handleChange} required placeholder="Name of your innovation" />
            </div>
            <div className="sp-input-group">
              <label>Track / Category <span className="req">*</span></label>
              <input type="text" name="track" onChange={handleChange} required placeholder="e.g. Fintech, Healthcare" />
            </div>
            <div className="sp-input-group">
              <label>Description <span className="req">*</span></label>
              <textarea name="description" onChange={handleChange} required rows="4" placeholder="Briefly describe your solution..."></textarea>
            </div>
          </div>

          <div className="sp-divider"></div>

          <div className="sp-form-section">
            <h3 className="sp-section-title">2. Submission Links</h3>
            <div className="sp-input-group">
              <label>Presentation Link (PPT/PDF) <span className="req">*</span></label>
              <input type="url" name="pptLink" onChange={handleChange} required placeholder="Google Drive or Canva link" />
            </div>
            <div className="sp-input-group">
              <label>GitHub Repository</label>
              <input type="url" name="repoLink" onChange={handleChange} placeholder="https://github.com/..." />
            </div>
            <div className="sp-input-group">
              <label>Video / Demo Link</label>
              <input type="url" name="demoLink" onChange={handleChange} placeholder="YouTube or Loom link" />
            </div>
          </div>

          <div className="sp-form-actions">
             <button type="button" className="sp-btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
             <button type="submit" className="sp-btn-primary" disabled={submitting || !!error}>
              {submitting ? 'Uploading...' : 'Confirm Submission'}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default SubmitProject;