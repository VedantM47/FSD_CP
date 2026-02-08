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
    maxTeamSize: '',
    prizePool: '',
    rules: '',
    terms: '',
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
          startDate: data.startDate?.slice(0, 10) || '',
          endDate: data.endDate?.slice(0, 10) || '',
          registrationDeadline: data.registrationDeadline?.slice(0, 10) || '',
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleJudge = (judgeId) => {
    setSelectedJudges(prev =>
      prev.includes(judgeId)
        ? prev.filter(id => id !== judgeId)
        : [...prev, judgeId]
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      let hackathonId;

      if (isEditMode) {
        await updateHackathon(id, formData);
        hackathonId = id;
      } else {
        const res = await createHackathon(formData);
        hackathonId = res.data.data._id;
      }

      // ✅ Assign judges AFTER save
      if (selectedJudges.length > 0) {
        await assignJudgesToHackathon(hackathonId, selectedJudges);
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
          {/* HEADER */}
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

          {error && <p className="error-text">{error}</p>}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="hackathon-form">
              {/* ================= BASIC DETAILS ================= */}
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

              {/* ================= DATES ================= */}
              <section className="form-section">
                <h2 className="form-section-title">Dates</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      className="form-input"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
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
                    type="date"
                    name="registrationDeadline"
                    className="form-input"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                  />
                </div>
              </section>

              {/* ================= RULES & REWARDS ================= */}
              <section className="form-section">
                <h2 className="form-section-title">Rules & Rewards</h2>

                <div className="form-group">
                  <label className="form-label">Max Team Size</label>
                  <input
                    type="number"
                    name="maxTeamSize"
                    className="form-input"
                    value={formData.maxTeamSize}
                    onChange={handleChange}
                  />
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

              {/* ================= JUDGES ================= */}
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

              {/* ================= ACTIONS ================= */}
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
