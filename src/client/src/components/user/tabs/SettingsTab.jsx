import { useState } from "react";
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
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [notifications, setNotifications] = useState({
    email: user?.notificationPreferences?.email ?? true,
    reminders: user?.notificationPreferences?.reminders ?? true,
    invites: user?.notificationPreferences?.invites ?? true,
    results: user?.notificationPreferences?.results ?? true,
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: user?.privacySettings?.publicProfile ?? true,
    showAchievements: user?.privacySettings?.showAchievements ?? true,
    allowInvites: user?.privacySettings?.allowInvites ?? true,
  });

  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState("");

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
        skills
      };

      await updateMyProfile(payload);
      setSuccess(true);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-grid">
      {/* ===== LEFT: Profile Form ===== */}
      <div className="settings-card">
        <h3 className="settings-card__title">Profile Information</h3>

        {[
          ["👤", "Full Name", "fullName"],
          ["✉", "Email", "email"],
          ["🏫", "College / Organization", "college"],
          ["🎓", "Course & Specialization", "department"],
          ["📍", "Location / Year", "year"],
          ["🔗", "GitHub", "github"],
          ["🔗", "LinkedIn", "linkedin"],
        ].map(([icon, label, key]) => (
          <div key={key} className="settings-field">
            <label>
              <span className="field-icon">{icon}</span> {label}
            </label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              disabled={key === "email"} /* email cannot be changed */
            />
          </div>
        ))}

        <div className="settings-field">
          <label>
            <span className="field-icon">🛠</span> Skills (press Enter)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            {skills.map(skill => (
              <span key={skill} style={{ background: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {skill}
                <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
            placeholder="e.g. React, Node.js, Python"
          />
        </div>

        <button
          className="btn-save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {success && <p className="save-success">✅ Profile updated!</p>}
        {error && (
          <p className="save-success" style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}
      </div>

      {/* ===== RIGHT: Preferences ===== */}
      <div className="settings-right">
        {/* Notification Preferences */}
        <div className="settings-card">
          <h3 className="settings-card__title">
            🔔 Notification Preferences
          </h3>

          {[
            ["Email Notifications", "Receive updates via email", "email"],
            [
              "Hackathon Reminders",
              "Deadline and round reminders",
              "reminders",
            ],
            ["Team Invitations", "Notify when invited to teams", "invites"],
            [
              "Result Announcements",
              "Get notified of results",
              "results",
            ],
          ].map(([title, desc, key]) => (
            <div key={key} className="toggle-row">
              <div className="toggle-row__info">
                <h5>{title}</h5>
                <p>{desc}</p>
              </div>
              <ToggleSwitch
                enabled={notifications[key]}
                onChange={() =>
                  setNotifications((p) => ({ ...p, [key]: !p[key] }))
                }
              />
            </div>
          ))}
        </div>

        {/* Privacy Settings */}
        <div className="settings-card">
          <h3 className="settings-card__title">🔒 Privacy Settings</h3>

          {[
            [
              "Public Profile",
              "Make profile visible to others",
              "publicProfile",
            ],
            [
              "Show Achievements",
              "Display wins and rankings",
              "showAchievements",
            ],
            [
              "Allow Team Invites",
              "Others can invite you to teams",
              "allowInvites",
            ],
          ].map(([title, desc, key]) => (
            <div key={key} className="toggle-row">
              <div className="toggle-row__info">
                <h5>{title}</h5>
                <p>{desc}</p>
              </div>
              <ToggleSwitch
                enabled={privacy[key]}
                onChange={() =>
                  setPrivacy((p) => ({ ...p, [key]: !p[key] }))
                }
              />
            </div>
          ))}
        </div>
      </div>
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