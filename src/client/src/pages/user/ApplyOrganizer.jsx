import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { applyForOrganizer } from '../../services/api';
import '../../styles/global.css';

const ApplyOrganizer = () => {
  const [motivation, setMotivation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await applyForOrganizer({ motivation });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '20px' }}>Apply to be an Organizer</h1>
        
        {success ? (
          <div>
            <p style={{ color: 'green', fontWeight: 'bold' }}>✅ Application submitted successfully! An admin will review your request soon.</p>
            <button onClick={() => navigate('/profile')} style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', marginTop: '20px', cursor: 'pointer' }}>
              Return to Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {error && <p style={{ color: 'red' }}>❌ {error}</p>}
            
            <label style={{ fontWeight: 'bold' }}>Why do you want to be an organizer?</label>
            <textarea 
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              rows={6}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Tell us about your organization or event plans..."
            />
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ background: '#10B981', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplyOrganizer;
