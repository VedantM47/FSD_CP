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
    email: true,
    reminders: true,
    invites: true,
    results: true,
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showAchievements: true,
    allowInvites: true,
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
    setError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      await updateMyProfile(form);
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