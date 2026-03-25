import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AdminNavbar from '../../components/admin/AdminNavbar';
import {
  createHackathon,
  updateHackathon,
  getHackathonById,
  getAllJudges,
  assignJudgesToHackathon,
} from '../../services/api';

import '../../styles/admin.css';

function CreateHackathon() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ================= JUDGES ================= */
  const [judges, setJudges] = useState([]);
  const [selectedJudges, setSelectedJudges] = useState([]);

  /* ================= FORM ================= */
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    minTeamSize: 1, // ✅ Added dynamic min size
    maxTeamSize: 4, // ✅ Added dynamic max size
    prizePool: '',
    rules: '',
    terms: '',
    image: null,
  });

  /* ================= LOAD JUDGES ================= */
  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const res = await getAllJudges();
        setJudges(res.data.data || []);
      } catch (err) {
        console.error('Failed to load judges', err);
      }
    };

    fetchJudges();
  }, []);

  /* ================= LOAD HACKATHON (EDIT MODE) ================= */
  useEffect(() => {
    if (!isEditMode) return;

    const fetchHackathon = async () => {
      try {
        setLoading(true);
        const res = await getHackathonById(id);
        const data = res.data.data;

        setFormData({
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'draft',
          startDate: data.startDate?.slice(0, 16) || '',
          endDate: data.endDate?.slice(0, 16) || '',
          registrationDeadline: data.registrationDeadline?.slice(0, 16) || '',
          minTeamSize: data.minTeamSize || 1, // ✅ Syncing minTeamSize from DB
          maxTeamSize: data.maxTeamSize || '',
          prizePool: data.prizePool || '',
          rules: data.rules || '',
          terms: data.terms || '',
        });

        // ✅ Prefill assigned judges
        setSelectedJudges(
          data.judges?.map(j => j.judgeUserId) || []
        );
      } catch (err) {
        console.error(err);
        setError('Failed to load hackathon details');
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [id, isEditMode]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    // Number validation for team size fields
    const finalValue = (name === 'minTeamSize' || name === 'maxTeamSize') 
      ? Math.max(1, parseInt(value) || 1) 
      : value;

    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const toggleJudge = (judgeId) => {
    setSelectedJudges(prev =>
      prev.includes(judgeId)
        ? prev.filter(id => id !== judgeId)
        : [...prev, judgeId]
    );
  };

  const handleSubmit = async () => {
    // 🔥 VALIDATION: Ensure logical team bounds
    if (formData.maxTeamSize < formData.minTeamSize) {
      setError(`Maximum team size (${formData.maxTeamSize}) cannot be less than minimum (${formData.minTeamSize}).`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && !formData[key]) return; // don't append null
        payload.append(key, formData[key]);
      });
      // Append manually for judges since it's an array
      payload.append('judges', JSON.stringify(selectedJudges));

      if (isEditMode) {
        await updateHackathon(id, payload);
      } else {
        const res = await createHackathon(payload);
        const hackathonId = res.data.data._id;
        if (selectedJudges.length > 0) {
          await assignJudgesToHackathon(hackathonId, selectedJudges); 
        }
      }

      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to save hackathon');
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

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

            <h1 className="page-title">
              {isEditMode ? 'Edit Hackathon' : 'Create Hackathon'}
            </h1>
          </div>

          {error && <p className="error-text" style={{ color: '#ef4444', marginBottom: '20px', fontWeight: 'bold' }}>{error}</p>}

          {loading ? (
            <div className="loading-container">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="hackathon-form-improved">
              {/* BASIC INFO SECTION */}
              <section className="form-section-card">
                <div className="form-section-header">
                  <h2 className="form-section-title-new">Basic Information</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group-full">
                    <label className="form-label-new">Hackathon Title</label>
                    <input
                      type="text"
                      name="title"
                      className="form-input-new"
                      placeholder="Enter hackathon title"
                      value={formData.title}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-full">
                    <label className="form-label-new">Description</label>
                    <textarea
                      name="description"
                      className="form-textarea-new"
                      rows="5"
                      placeholder="Describe your hackathon..."
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label-new">Banner Image</label>
                    <input
                      type="file"
                      name="image"
                      className="form-input-file"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    {isEditMode && <small className="form-hint">Leave blank to keep existing image</small>}
                  </div>

                  <div className="form-group">
                    <label className="form-label-new">Status</label>
                    <select
                      name="status"
                      className="form-select-new"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="draft">Draft</option>
                      <option value="open">Open</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* DATES SECTION */}
              <section className="form-section-card">
                <div className="form-section-header">
                  <h2 className="form-section-title-new">Dates & Timeline</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label-new">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      className="form-input-new"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label-new">End Date & Time</label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      className="form-input-new"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-full">
                    <label className="form-label-new">Registration Deadline</label>
                    <input
                      type="datetime-local"
                      name="registrationDeadline"
                      className="form-input-new"
                      value={formData.registrationDeadline}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </section>

              {/* TEAM & REWARDS SECTION */}
              <section className="form-section-card">
                <div className="form-section-header">
                  <h2 className="form-section-title-new">Team & Rewards</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label-new">Minimum Team Size</label>
                    <input
                      type="number"
                      name="minTeamSize"
                      className="form-input-new"
                      placeholder="e.g., 1"
                      value={formData.minTeamSize}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label-new">Maximum Team Size</label>
                    <input
                      type="number"
                      name="maxTeamSize"
                      className="form-input-new"
                      placeholder="e.g., 4"
                      value={formData.maxTeamSize}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>

                  <div className="form-group-full">
                    <label className="form-label-new">Prize Pool</label>
                    <input
                      type="text"
                      name="prizePool"
                      className="form-input-new"
                      placeholder="e.g., $10,000"
                      value={formData.prizePool}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </section>

              {/* RULES & TERMS SECTION */}
              <section className="form-section-card">
                <div className="form-section-header">
                  <h2 className="form-section-title-new">Rules & Terms</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group-full">
                    <label className="form-label-new">Rules</label>
                    <textarea
                      name="rules"
                      className="form-textarea-new"
                      rows="5"
                      placeholder="Enter hackathon rules..."
                      value={formData.rules}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group-full">
                    <label className="form-label-new">Terms & Conditions</label>
                    <textarea
                      name="terms"
                      className="form-textarea-new"
                      rows="5"
                      placeholder="Enter terms and conditions..."
                      value={formData.terms}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </section>

              {/* JUDGES SECTION */}
              <section className="form-section-card">
                <div className="form-section-header">
                  <h2 className="form-section-title-new">Assign Judges</h2>
                </div>

                {judges.length === 0 ? (
                  <div className="empty-state">
                    <p>No judges available. Please add judges to the system first.</p>
                  </div>
                ) : (
                  <div className="judge-grid">
                    {judges.map(judge => (
                      <label key={judge._id} className="judge-checkbox-card">
                        <input
                          type="checkbox"
                          className="judge-checkbox"
                          checked={selectedJudges.includes(judge._id)}
                          onChange={() => toggleJudge(judge._id)}
                        />
                        <div className="judge-info">
                          <div className="judge-avatar">
                            {judge.fullName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="judge-details">
                            <span className="judge-name">{judge.fullName}</span>
                            <span className="judge-email">{judge.email}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              {/* ACTIONS */}
              <div className="form-actions-new">
                <button
                  className="btn-cancel"
                  onClick={() => navigate('/admin/dashboard')}
                  type="button"
                >
                  Cancel
                </button>

                <button
                  className="btn-submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  type="button"
                >
                  {loading ? 'Saving...' : (isEditMode ? 'Update Hackathon' : 'Create Hackathon')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="admin-footer">
        <div className="footer-content">
          <span className="footer-brand">HackPlatform</span>
        </div>
      </footer>
    </div>
  );
}

export default CreateHackathon;