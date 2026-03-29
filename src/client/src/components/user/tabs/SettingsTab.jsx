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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.skill-search-container')) {
        setShowSkillDropdown(false);
      }
      if (!e.target.closest('.interest-search-container')) {
        setShowInterestDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  const [interests, setInterests] = useState(user?.interests || []);
  
  // Skill search state
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  
  // Interest search state
  const [interestSearchQuery, setInterestSearchQuery] = useState("");
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);

  // Predefined skills list
  const predefinedSkills = [
    "JavaScript", "Python", "Java", "C++", "C#", "TypeScript", "React", "Angular", "Vue.js",
    "Node.js", "Express.js", "Django", "Flask", "Spring Boot", "ASP.NET",
    "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Material UI",
    "MongoDB", "MySQL", "PostgreSQL", "Redis", "Firebase",
    "Git", "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud",
    "Machine Learning", "Deep Learning", "Data Science", "AI", "NLP",
    "React Native", "Flutter", "Swift", "Kotlin", "Android", "iOS",
    "GraphQL", "REST API", "Microservices", "DevOps", "CI/CD",
    "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy",
    "Figma", "Adobe XD", "UI/UX Design", "Photoshop", "Illustrator",
    "Blockchain", "Solidity", "Web3", "Ethereum", "Smart Contracts",
    "Testing", "Jest", "Mocha", "Selenium", "Cypress",
    "Agile", "Scrum", "Project Management", "Leadership", "Communication"
  ];

  // Predefined interests list
  const predefinedInterests = [
    "Web Development", "Mobile Development", "Game Development", "AI/ML",
    "Data Science", "Cybersecurity", "Cloud Computing", "DevOps",
    "Blockchain", "IoT", "AR/VR", "Robotics",
    "UI/UX Design", "Product Design", "Graphic Design",
    "Competitive Programming", "Open Source", "Hackathons",
    "Entrepreneurship", "Startups", "Innovation",
    "Teaching", "Mentoring", "Public Speaking",
    "Research", "Academia", "Writing", "Blogging"
  ];

  // Filter skills based on search
  const filteredSkills = predefinedSkills.filter(skill => 
    skill.toLowerCase().includes(skillSearchQuery.toLowerCase()) &&
    !skills.includes(skill)
  );

  // Filter interests based on search
  const filteredInterests = predefinedInterests.filter(interest => 
    interest.toLowerCase().includes(interestSearchQuery.toLowerCase()) &&
    !interests.includes(interest)
  );

  const addSkillFromSearch = (skill) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillSearchQuery("");
      setShowSkillDropdown(false);
    }
  };

  const addCustomSkill = () => {
    const trimmed = skillSearchQuery.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillSearchQuery("");
      setShowSkillDropdown(false);
    }
  };

  const addInterestFromSearch = (interest) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest]);
      setInterestSearchQuery("");
      setShowInterestDropdown(false);
    }
  };

  const addCustomInterest = () => {
    const trimmed = interestSearchQuery.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setInterestSearchQuery("");
      setShowInterestDropdown(false);
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
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
      
      // Filter out empty skills and interests
      const validSkills = skills.filter(s => s && s.trim());
      const validInterests = interests.filter(i => i && i.trim());
      
      const payload = {
        ...form,
        notificationPreferences: notifications,
        privacySettings: privacy,
        skills: validSkills,
        interests: validInterests
      };

      await updateMyProfile(payload);
      setSuccess(true);
      setIsEditing(false);
      
      // Update local state with filtered values
      setSkills(validSkills);
      setInterests(validInterests);
      
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
          
          {/* Skills Section */}
          <div className="settings-field" style={{ marginBottom: '24px' }}>
            <label>Skills</label>
            {!isEditing ? (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: skills.length === 0 ? '12px' : '0' }}>
                  {skills.length > 0 ? (
                    skills.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))
                  ) : (
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>No skills added yet. Click "Edit Profile" to add skills.</p>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Search Input */}
                <div className="skill-search-container" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={(e) => {
                      setSkillSearchQuery(e.target.value);
                      setShowSkillDropdown(true);
                    }}
                    onFocus={() => setShowSkillDropdown(true)}
                    placeholder="Search or type a skill..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '0.95rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomSkill();
                      }
                    }}
                  />
                  
                  {/* Dropdown */}
                  {showSkillDropdown && skillSearchQuery && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      marginTop: '4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 10
                    }}>
                      {filteredSkills.length > 0 ? (
                        filteredSkills.slice(0, 10).map(skill => (
                          <div
                            key={skill}
                            onClick={() => addSkillFromSearch(skill)}
                            style={{
                              padding: '10px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f3f4f6',
                              fontSize: '0.9rem',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                          >
                            {skill}
                          </div>
                        ))
                      ) : null}
                      
                      {/* Add custom option */}
                      {skillSearchQuery.trim() && (
                        <div
                          onClick={addCustomSkill}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            color: '#2563eb',
                            fontWeight: '600',
                            backgroundColor: '#eff6ff',
                            borderTop: filteredSkills.length > 0 ? '2px solid #e5e7eb' : 'none'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#dbeafe'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#eff6ff'}
                        >
                          + Add "{skillSearchQuery.trim()}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Display added skills */}
                {skills.length === 0 ? (
                  <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>
                      No skills added yet. Search or type above to add skills.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skills.map((skill, index) => (
                      <span key={index} className="skill-tag" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        padding: '6px 12px'
                      }}>
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            lineHeight: '1',
                            padding: '0',
                            marginLeft: '4px'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interests Section */}
          <div className="settings-field">
            <label>Interests</label>
            {!isEditing ? (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: interests.length === 0 ? '12px' : '0' }}>
                  {interests.length > 0 ? (
                    interests.map(interest => (
                      <span key={interest} className="skill-tag" style={{ background: '#fef3c7', color: '#d97706', borderColor: '#fde68a' }}>
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>No interests added yet. Click "Edit Profile" to add interests.</p>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Search Input */}
                <div className="interest-search-container" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={interestSearchQuery}
                    onChange={(e) => {
                      setInterestSearchQuery(e.target.value);
                      setShowInterestDropdown(true);
                    }}
                    onFocus={() => setShowInterestDropdown(true)}
                    placeholder="Search or type an interest..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '0.95rem',
                      border: '2px solid #fde68a',
                      borderRadius: '8px',
                      outline: 'none',
                      backgroundColor: '#fffbeb'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomInterest();
                      }
                    }}
                  />
                  
                  {/* Dropdown */}
                  {showInterestDropdown && interestSearchQuery && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: 'white',
                      border: '1px solid #fde68a',
                      borderRadius: '8px',
                      marginTop: '4px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 10
                    }}>
                      {filteredInterests.length > 0 ? (
                        filteredInterests.slice(0, 10).map(interest => (
                          <div
                            key={interest}
                            onClick={() => addInterestFromSearch(interest)}
                            style={{
                              padding: '10px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #fef3c7',
                              fontSize: '0.9rem',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#fffbeb'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                          >
                            {interest}
                          </div>
                        ))
                      ) : null}
                      
                      {/* Add custom option */}
                      {interestSearchQuery.trim() && (
                        <div
                          onClick={addCustomInterest}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            color: '#d97706',
                            fontWeight: '600',
                            backgroundColor: '#fef3c7',
                            borderTop: filteredInterests.length > 0 ? '2px solid #fde68a' : 'none'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#fde68a'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#fef3c7'}
                        >
                          + Add "{interestSearchQuery.trim()}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Display added interests */}
                {interests.length === 0 ? (
                  <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    backgroundColor: '#fffbeb', 
                    borderRadius: '8px',
                    border: '1px solid #fde68a'
                  }}>
                    <p style={{ margin: '0', color: '#92400e', fontSize: '0.9rem' }}>
                      No interests added yet. Search or type above to add interests.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {interests.map((interest, index) => (
                      <span key={index} className="skill-tag" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        padding: '6px 12px',
                        background: '#fef3c7', 
                        color: '#d97706', 
                        borderColor: '#fde68a'
                      }}>
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            lineHeight: '1',
                            padding: '0',
                            marginLeft: '4px'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
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