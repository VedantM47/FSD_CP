import { useState } from "react";

const Toggle = ({ enabled, onChange }) => (
  <button
    onClick={onChange}
    className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
      enabled ? "bg-blue-600" : "bg-gray-300"
    }`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
        enabled ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

const SettingsTab = () => {
  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "john.doe@university.edu",
    college: "Massachusetts Institute of Technology",
    course: "B.Tech Computer Science & Engineering",
    location: "Cambridge, Massachusetts",
  });

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ================= LEFT: PROFILE INFO ================= */}
      <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Profile Information
        </h3>

        <div className="space-y-4">
          {[
            ["Full Name", "fullName"],
            ["Email", "email"],
            ["College / Organization", "college"],
            ["Course & Specialization", "course"],
            ["Location", "location"],
          ].map(([label, key]) => (
            <div key={key} className="text-gray-200">
              <label className="block text-sm text-gray-800 mb-1">
                {label}
              </label>
              <input
                type="text"
                placeholder={profile[key]}
                onChange={(e) =>
                  setProfile({ ...profile, [key]: e.target.value })
                }
                className={`w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 text-gray-500 focus:ring-blue-500 outline-none ${"bg-blue-50 text-blue-600 border border-blue-600"} `}
              />
            </div>
          ))}
        </div>

        <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          Save Changes
        </button>
      </div>

      {/* ================= RIGHT: SETTINGS ================= */}
      <div className="space-y-6">

        {/* Notifications */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔔 Notification Preferences
          </h3>

          {[
            ["Email Notifications", "Receive updates via email", "email"],
            ["Hackathon Reminders", "Deadline & round reminders", "reminders"],
            ["Team Invitations", "Notify when invited to teams", "invites"],
            ["Result Announcements", "Get notified of results", "results"],
          ].map(([title, desc, key]) => (
            <div key={key} className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm font-medium text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <Toggle
                enabled={notifications[key]}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    [key]: !notifications[key],
                  })
                }
              />
            </div>
          ))}
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔒 Privacy Settings
          </h3>

          {[
            ["Public Profile", "Make profile visible to others", "publicProfile"],
            ["Show Achievements", "Display wins and rankings", "showAchievements"],
            ["Allow Team Invites", "Others can invite you to teams", "allowInvites"],
          ].map(([title, desc, key]) => (
            <div key={key} className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm font-medium text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <Toggle
                enabled={privacy[key]}
                onChange={() =>
                  setPrivacy({
                    ...privacy,
                    [key]: !privacy[key],
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;