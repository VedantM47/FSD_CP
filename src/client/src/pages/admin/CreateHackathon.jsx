import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { AdminDomainSelectForCreation } from "../../components/AdminDomainSelectForCreation";
import {
  createHackathon,
  updateHackathon,
  getHackathonById,
  searchUsers,
} from "../../services/api";
import "../../styles/admin.css";

function CreateHackathon() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // BUG FIX: Start in a loading state when editing so the form (and
  // AdminDomainSelectForCreation) doesn't mount with empty data and then
  // re-mount once the fetch resolves.  In create mode we start ready.
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState("");

  /* ================= ROLE MANAGEMENT STATE ================= */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // We store objects { _id, fullName, email } to display them nicely
  const [selectedJudges, setSelectedJudges] = useState([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);

  /* ================= DOMAIN STATE ================= */
  const [selectedDomains, setSelectedDomains] = useState([]);

  /* ================= FORM ================= */
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "draft",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    minTeamSize: 1,
    maxTeamSize: 4,
    prizePool: "",
    rules: "",
    terms: "",
    image: null,
  });

  /* ================= LOAD HACKATHON (EDIT MODE) ================= */
  useEffect(() => {
    if (!isEditMode) return;

    const fetchHackathon = async () => {
      try {
        setLoading(true);
        const res = await getHackathonById(id);
        const data = res.data.data;

        setFormData({
          title: data.title || "",
          description: data.description || "",
          status: data.status || "draft",
          startDate: data.startDate?.slice(0, 16) || "",
          endDate: data.endDate?.slice(0, 16) || "",
          registrationDeadline: data.registrationDeadline?.slice(0, 16) || "",
          minTeamSize: data.minTeamSize || 1,
          maxTeamSize: data.maxTeamSize || 4,
          prizePool: data.prizePool || "",
          rules: data.rules || "",
          terms: data.terms || "",
        });

        // Load existing domains
        if (data.domains && Array.isArray(data.domains)) {
          setSelectedDomains(data.domains);
        }

        if (data.judges) {
          setSelectedJudges(
            data.judges.map((j) => ({
              _id: j.judgeUserId._id || j.judgeUserId,
              fullName: j.judgeUserId.fullName || "Judge",
              email: j.judgeUserId.email || "",
            })),
          );
        }
        if (data.organizers) {
          setSelectedOrganizers(
            data.organizers.map((o) => ({
              _id: o.organizerUserId._id || o.organizerUserId,
              fullName: o.organizerUserId.fullName || "Organizer",
              email: o.organizerUserId.email || "",
            })),
          );
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load hackathon details");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [id, isEditMode]);

  /* ================= LIVE SEARCH HANDLER ================= */
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        try {
          const res = await searchUsers(searchQuery);
          setSearchResults(res.data.data || []);
        } catch (err) {
          console.error("Search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleAddRole = (user, roleType) => {
    if (
      roleType === "judge" &&
      !selectedJudges.some((j) => j._id === user._id)
    ) {
      setSelectedJudges((prev) => [...prev, user]);
    } else if (
      roleType === "organizer" &&
      !selectedOrganizers.some((o) => o._id === user._id)
    ) {
      setSelectedOrganizers((prev) => [...prev, user]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveRole = (userId, roleType) => {
    if (roleType === "judge") {
      setSelectedJudges((prev) => prev.filter((j) => j._id !== userId));
    } else {
      setSelectedOrganizers((prev) => prev.filter((o) => o._id !== userId));
    }
  };

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    const finalValue =
      name === "minTeamSize" || name === "maxTeamSize"
        ? Math.max(1, parseInt(value) || 1)
        : value;

    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async () => {
    if (formData.maxTeamSize < formData.minTeamSize) {
      setError(
        `Maximum team size (${formData.maxTeamSize}) cannot be less than minimum (${formData.minTeamSize}).`,
      );
      return;
    }

    if (selectedDomains.length === 0) {
      setError("Please select at least one domain for the hackathon");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "image" && !formData[key]) return;
        payload.append(key, formData[key]);
      });

      payload.append(
        "judges",
        JSON.stringify(selectedJudges.map((j) => j._id)),
      );
      payload.append(
        "organizers",
        JSON.stringify(selectedOrganizers.map((o) => o._id)),
      );
      payload.append("domains", JSON.stringify(selectedDomains));

      if (isEditMode) {
        await updateHackathon(id, payload);
      } else {
        await createHackathon(payload);
      }

      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to save hackathon");
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
              onClick={() => navigate("/admin/dashboard")}
            >
              ← Back to Dashboard
            </button>
            <h1 className="page-title">
              {isEditMode ? "Edit Hackathon" : "Create Hackathon"}
            </h1>
          </div>

          {error && (
            <p
              className="error-text"
              style={{
                color: "#ef4444",
                marginBottom: "20px",
                fontWeight: "bold",
              }}
            >
              {error}
            </p>
          )}

          {loading ? (
            <div className="loading-container">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="hackathon-form-improved">
              {/* --- Basic Info Section --- */}
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
                    {isEditMode && (
                      <small className="form-hint">
                        Leave blank to keep existing image
                      </small>
                    )}
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

              {/* --- Dates Section --- */}
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
                    <label className="form-label-new">
                      Registration Deadline
                    </label>
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

              {/* --- Team & Rewards Section --- */}
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

              {/* --- Rules & Terms --- */}
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
                      value={formData.terms}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </section>

              {/* --- NEW: Problem Domains Section --- */}
              <section className="form-section-card">
                <AdminDomainSelectForCreation
                  onDomainsChange={setSelectedDomains}
                  initialDomains={selectedDomains}
                />
              </section>

              {/* NEW: Search & Assign Roles Section */}
              <section className="form-section-card">
                <div className="form-section-header">
                  <h2 className="form-section-title-new">
                    Appoint Judges & Organizers
                  </h2>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginTop: "5px",
                    }}
                  >
                    Search for any registered user to assign them a role in this
                    hackathon.
                  </p>
                </div>

                {/* Search Bar */}
                <div style={{ position: "relative", marginBottom: "25px" }}>
                  <input
                    type="text"
                    className="form-input-new"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: "12px 16px",
                      fontSize: "1rem",
                      border: "2px solid #e5e7eb",
                    }}
                  />
                  {isSearching && (
                    <span
                      style={{
                        position: "absolute",
                        right: "15px",
                        top: "12px",
                        color: "#9ca3af",
                      }}
                    >
                      Searching...
                    </span>
                  )}

                  {/* Dropdown Results */}
                  {searchResults.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        zIndex: 10,
                        maxHeight: "250px",
                        overflowY: "auto",
                        marginTop: "5px",
                      }}
                    >
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 16px",
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          <div>
                            <div
                              style={{ fontWeight: "bold", color: "#111827" }}
                            >
                              {user.fullName}
                            </div>
                            <div
                              style={{ fontSize: "0.85rem", color: "#6b7280" }}
                            >
                              {user.email}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              type="button"
                              onClick={() => handleAddRole(user, "judge")}
                              style={{
                                padding: "6px 12px",
                                background: "#eff6ff",
                                color: "#2563eb",
                                border: "1px solid #bfdbfe",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                              }}
                            >
                              + Judge
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddRole(user, "organizer")}
                              style={{
                                padding: "6px 12px",
                                background: "#ecfdf5",
                                color: "#059669",
                                border: "1px solid #a7f3d0",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                              }}
                            >
                              + Organizer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Display Selected Roles */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  {/* Selected Organizers */}
                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "15px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 10px 0",
                        color: "#065f46",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      Assigned Organizers ({selectedOrganizers.length})
                    </h4>
                    {selectedOrganizers.length === 0 ? (
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#9ca3af",
                          margin: 0,
                        }}
                      >
                        No organizers assigned yet.
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        {selectedOrganizers.map((org) => (
                          <div
                            key={org._id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              background: "white",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid #d1fae5",
                              fontSize: "0.9rem",
                            }}
                          >
                            <span>
                              <strong>{org.fullName}</strong>{" "}
                              <span
                                style={{ color: "#6b7280", fontSize: "0.8rem" }}
                              >
                                ({org.email})
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRole(org._id, "organizer")
                              }
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontWeight: "bold",
                              }}
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Judges */}
                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "15px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 10px 0",
                        color: "#1e40af",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      Assigned Judges ({selectedJudges.length})
                    </h4>
                    {selectedJudges.length === 0 ? (
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#9ca3af",
                          margin: 0,
                        }}
                      >
                        No judges assigned yet.
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        {selectedJudges.map((judge) => (
                          <div
                            key={judge._id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              background: "white",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid #dbeafe",
                              fontSize: "0.9rem",
                            }}
                          >
                            <span>
                              <strong>{judge.fullName}</strong>{" "}
                              <span
                                style={{ color: "#6b7280", fontSize: "0.8rem" }}
                              >
                                ({judge.email})
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRole(judge._id, "judge")
                              }
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontWeight: "bold",
                              }}
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* --- Submit --- */}
              <div className="form-actions-new">
                <button
                  className="btn-cancel"
                  onClick={() => navigate("/admin/dashboard")}
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
                  {loading
                    ? "Saving..."
                    : isEditMode
                      ? "Update Hackathon"
                      : "Create Hackathon"}
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
