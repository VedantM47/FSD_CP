import { useState, useEffect } from "react";
import { updateMyProfile } from "../../../services/api";

const SettingsTab = ({ user, onUpdate }) => {
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    college: user?.college || "",
    department: user?.department || "",
    year: user?.year || "",
    github: user?.github || "",
    linkedin: user?.linkedin || "",
    website: user?.website || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    major: user?.major || "",
    state: user?.state || "",
    city: user?.city || "",
    collegeState: user?.collegeState || "",
    collegeCity: user?.collegeCity || "",
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
    gender: user?.gender || "Male",
    degree: user?.degree || "",
    graduationYear: user?.graduationYear || "",
    resumeUrl: user?.resumeUrl || "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        college: user.college || "",
        department: user.department || "",
        year: user.year || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        website: user.website || "",
        bio: user.bio || "",
        phone: user.phone || "",
        major: user.major || "",
        state: user.state || "",
        city: user.city || "",
        collegeState: user.collegeState || "",
        collegeCity: user.collegeCity || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        gender: user.gender || "Male",
        degree: user.degree || "",
        graduationYear: user.graduationYear || "",
        resumeUrl: user.resumeUrl || "",
      });
      setNotifications({
        emailAlerts: user.notificationPreferences?.emailAlerts ?? true,
        teamInvites: user.notificationPreferences?.teamInvites ?? true,
        hackathonUpdates: user.notificationPreferences?.hackathonUpdates ?? true,
      });
      setPrivacy({
        showEmail: user.privacySettings?.showEmail ?? false,
        showPhone: user.privacySettings?.showPhone ?? false,
        showCollege: user.privacySettings?.showCollege ?? true,
        showTeams: user.privacySettings?.showTeams ?? true,
        allowInvites: user.privacySettings?.allowInvites ?? true,
      });
      setSkills(user.skills || []);
      setInterests(user.interests || []);
    }
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [notifications, setNotifications] = useState({
    emailAlerts: user?.notificationPreferences?.emailAlerts ?? true,
    teamInvites: user?.notificationPreferences?.teamInvites ?? true,
    hackathonUpdates: user?.notificationPreferences?.hackathonUpdates ?? true,
  });

  const [privacy, setPrivacy] = useState({
    showEmail: user?.privacySettings?.showEmail ?? false,
    showPhone: user?.privacySettings?.showPhone ?? false,
    showCollege: user?.privacySettings?.showCollege ?? true,
    showTeams: user?.privacySettings?.showTeams ?? true,
    allowInvites: user?.privacySettings?.allowInvites ?? true,
  });

  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [interests, setInterests] = useState(user?.interests || []);
  const [interestInput, setInterestInput] = useState("");

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (newSkill && (!skills.includes(newSkill))) {
        setSkills([...skills, newSkill]);
        setSkillInput("");
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddInterest = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newInterest = interestInput.trim();
      if (newInterest && (!interests.includes(newInterest))) {
        setInterests([...interests, newInterest]);
        setInterestInput("");
      }
    }
  };

  const removeInterest = (interestToRemove) => {
    setInterests(interests.filter(i => i !== interestToRemove));
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
    setError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      
      const payload = {
        ...form,
        notificationPreferences: notifications,
        privacySettings: privacy,
        skills,
        interests
      };

      await updateMyProfile(payload);
      setSuccess(true);
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div>
          <h2 className="settings-title">Your Profile</h2>
          <p className="settings-subtitle">Complete your profile to participate in the hackathon</p>
        </div>
        {!isEditing ? (
          <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
            ✏️ Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
             <button className="btn-cancel-edit" onClick={() => setIsEditing(false)}>Cancel</button>
             <button className="btn-save-profile" onClick={handleSave} disabled={saving}>
               {saving ? "Saving..." : "Save Changes"}
             </button>
          </div>
        )}
      </div>

      <div className="settings-content">
        {/* Personal Information */}
        <div className="settings-section">
          <h3 className="section-title">Personal Information</h3>
          <div className="fields-grid">
            <ProfileField label="Full Name *" value={form.fullName} isEditing={isEditing} onChange={(v) => handleChange("fullName", v)} required />
            <ProfileField label="Phone Number" value={form.phone} isEditing={isEditing} onChange={(v) => handleChange("phone", v)} />
            <ProfileField label="Email Address" value={form.email} isEditing={false} disabled />
            <ProfileField label="Date of Birth" value={form.dateOfBirth} isEditing={isEditing} type="date" onChange={(v) => handleChange("dateOfBirth", v)} />
            <ProfileField label="Gender" value={form.gender} isEditing={isEditing} type="select" options={['Male', 'Female', 'Other', 'Prefer Not to Say']} onChange={(v) => handleChange("gender", v)} />
            <ProfileField label="Bio" value={form.bio} isEditing={isEditing} type="textarea" onChange={(v) => handleChange("bio", v)} fullWidth />
          </div>
        </div>

        {/* Residence Information */}
        <div className="settings-section">
          <h3 className="section-title">Residence Information</h3>
          <div className="fields-grid">
            <ProfileField label="State *" value={form.state} isEditing={isEditing} onChange={(v) => handleChange("state", v)} required />
            <ProfileField label="City" value={form.city} isEditing={isEditing} onChange={(v) => handleChange("city", v)} />
          </div>
        </div>

        {/* Education Information */}
        <div className="settings-section">
          <h3 className="section-title">Education Information</h3>
          <div className="fields-grid">
            <ProfileField label="College/University" value={form.college} isEditing={isEditing} onChange={(v) => handleChange("college", v)} fullWidth />
            <ProfileField label="College State" value={form.collegeState} isEditing={isEditing} onChange={(v) => handleChange("collegeState", v)} />
            <ProfileField label="College City" value={form.collegeCity} isEditing={isEditing} onChange={(v) => handleChange("collegeCity", v)} />
            <ProfileField label="Degree" value={form.degree} isEditing={isEditing} type="select" options={['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'BCA', 'MCA', 'PhD', 'Other']} onChange={(v) => handleChange("degree", v)} />
            <ProfileField label="Branch/Specialization" value={form.major} isEditing={isEditing} onChange={(v) => handleChange("major", v)} />
            <ProfileField label="Graduation Year" value={form.graduationYear} isEditing={isEditing} type="number" onChange={(v) => handleChange("graduationYear", v)} />
          </div>
        </div>

        {/* Social & Links */}
        <div className="settings-section">
          <h3 className="section-title">Social & Links</h3>
          <div className="fields-grid">
            <ProfileField label="LinkedIn Profile URL" value={form.linkedin} isEditing={isEditing} onChange={(v) => handleChange("linkedin", v)} />
            <ProfileField label="GitHub Profile URL" value={form.github} isEditing={isEditing} onChange={(v) => handleChange("github", v)} />
            <ProfileField label="Portfolio Website" value={form.website} isEditing={isEditing} onChange={(v) => handleChange("website", v)} />
            <ProfileField label="Resume URL (PDF)" value={form.resumeUrl} isEditing={isEditing} onChange={(v) => handleChange("resumeUrl", v)} />
          </div>
        </div>

        {/* Skills */}
        <div className="settings-section">
          <h3 className="section-title">Skills & Interests</h3>
          <div className="settings-field">
            <label>Skills (press Enter)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {skills.map(skill => (
                <span key={skill} className="skill-tag">
                  {skill}
                  {isEditing && <button onClick={() => removeSkill(skill)}>&times;</button>}
                </span>
              ))}
            </div>
            {isEditing && (
              <input
                type="text"
                className="skill-input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Add a skill..."
              />
            )}
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">Profile updated successfully!</p>}
      </div>

      <div className="settings-sidebar">
        {/* Notification Preferences */}
        <div className="settings-card shadow-sm">
          <h3 className="settings-card__title">🔔 Notifications</h3>
          {[
            ["Email Alerts", "Receive general email updates", "emailAlerts"],
            ["Team Invites", "Notify when invited to teams", "teamInvites"],
          ].map(([title, desc, key]) => (
            <div key={key} className="toggle-row">
              <div className="toggle-row__info">
                <h5>{title}</h5>
                <p>{desc}</p>
              </div>
              <ToggleSwitch
                enabled={notifications[key]}
                onChange={() => isEditing && setNotifications((p) => ({ ...p, [key]: !p[key] }))}
              />
            </div>
          ))}
        </div>

        {/* Privacy Settings */}
        <div className="settings-card shadow-sm">
          <h3 className="settings-card__title">🔒 Privacy</h3>
          {[
            ["Public Profile", "Allow others to see your profile", "publicProfile"],
            ["Allow Team Invites", "Others can invite you to teams", "allowInvites"],
          ].map(([title, desc, key]) => (
            <div key={key} className="toggle-row">
              <div className="toggle-row__info">
                <h5>{title}</h5>
                <p>{desc}</p>
              </div>
              <ToggleSwitch
                enabled={privacy[key]}
                onChange={() => isEditing && setPrivacy((p) => ({ ...p, [key]: !p[key] }))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value, isEditing, onChange, type = "text", options = [], required = false, fullWidth = false, disabled = false }) => {
  return (
    <div className={`profile-field ${fullWidth ? 'full-width' : ''}`}>
      <label>{label}</label>
      {!isEditing ? (
        <div className="read-only-value">{value || ""}</div>
      ) : (
        <>
          {type === "textarea" ? (
            <textarea value={value} onChange={(e) => onChange(e.target.value)} required={required} disabled={disabled} />
          ) : type === "select" ? (
            <select value={value} onChange={(e) => onChange(e.target.value)} required={required} disabled={disabled}>
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} disabled={disabled} />
          )}
        </>
      )}
    </div>
  );
};

/* ===== Toggle Switch Component ===== */
const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    className={`toggle-switch ${enabled ? "toggle-switch--on" : "toggle-switch--off"
      }`}
    onClick={onChange}
    type="button"
  >
    <div className="toggle-switch__knob" />
  </button>
);

export default SettingsTab;