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
            <p>Loading...</p>
          ) : (
            <div className="hackathon-form">
              {/* BASIC DETAILS */}
              <section className="form-section">
                <h2 className="form-section-title">Hackathon Details</h2>

                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Banner Image</label>
                  <input
                    type="file"
                    name="image"
                    className="form-input"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  {isEditMode && <small className="text-gray-500">Leave blank to keep existing image</small>}
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </section>

              {/* DATES */}
              <section className="form-section">
                <h2 className="form-section-title">Dates</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      className="form-input"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      className="form-input"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    className="form-input"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                  />
                </div>
              </section>

              {/* RULES & REWARDS */}
              <section className="form-section">
                <h2 className="form-section-title">Rules & Requirements</h2>

                {/* ✅ UPDATED TEAM SIZE INPUTS */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Min Team Size</label>
                    <input
                      type="number"
                      name="minTeamSize"
                      className="form-input"
                      value={formData.minTeamSize}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Max Team Size</label>
                    <input
                      type="number"
                      name="maxTeamSize"
                      className="form-input"
                      value={formData.maxTeamSize}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Prize Pool</label>
                  <input
                    type="text"
                    name="prizePool"
                    className="form-input"
                    value={formData.prizePool}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rules</label>
                  <textarea
                    name="rules"
                    className="form-textarea"
                    rows="4"
                    value={formData.rules}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Terms & Conditions</label>
                  <textarea
                    name="terms"
                    className="form-textarea"
                    rows="4"
                    value={formData.terms}
                    onChange={handleChange}
                  />
                </div>
              </section>

              {/* JUDGES */}
              <section className="form-section">
                <h2 className="form-section-title">Assign Judges</h2>

                {judges.length === 0 ? (
                  <p>No judges available</p>
                ) : (
                  <div className="judge-list">
                    {judges.map(judge => (
                      <label key={judge._id} className="judge-item">
                        <input
                          type="checkbox"
                          checked={selectedJudges.includes(judge._id)}
                          onChange={() => toggleJudge(judge._id)}
                        />
                        <span>
                          {judge.fullName} ({judge.email})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              {/* ACTIONS */}
              <div className="form-actions">
                <button
                  className="btn-secondary"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Cancel
                </button>

                <button
                  className="btn-primary"
                  onClick={handleSubmit}
                >
                  {isEditMode ? 'Update Hackathon' : 'Create Hackathon'}
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