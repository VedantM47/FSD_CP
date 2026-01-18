import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/RegisterHackathon.css';

const RegisterHackathon = () => {
  const navigate = useNavigate();

  // 1. STATE FOR FORM
  const [formData, setFormData] = useState({
    fullName: '', 
    email: '', 
    phone: '', 
    college: '', 
    major: '', 
    academicYear: '',
    teamName: '', 
    projectIdea: '', 
    lookingForMembers: false
  });

  // 2. STATE FOR MEMBERS LIST
  const [members, setMembers] = useState([]);

  // --- CHANGED: Handle Inputs with Phone Validation ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // A. STRICT PHONE NUMBER HANDLING
    if (name === 'phone') {
      // 1. Remove anything that isn't a number
      const numericValue = value.replace(/[^0-9]/g, '');
      
      // 2. Limit to 10 digits maximum (Stop user from typing 11th digit)
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return; // Stop here so we don't run the default logic below
    }

    // B. DEFAULT HANDLING FOR OTHER INPUTS
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Logic to Add a Member
  const handleAddMember = () => {
    if (members.length < 3) {
      setMembers([...members, { name: '', email: '' }]);
    } else {
      alert("Maximum 3 additional members allowed.");
    }
  };

  // Logic to Remove a Member
  const handleRemoveMember = (index) => {
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  };

  // Logic to Update Member Input
  const handleMemberChange = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  // 3. HANDLE SUBMIT (VALIDATION + PAYLOAD)
  const handleSubmit = (e) => {
    e.preventDefault();

    // A. PHONE NUMBER LENGTH CHECK
    if (formData.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    // B. REQUIRED FIELDS CHECK
    const requiredFields = ['fullName', 'email', 'phone', 'college', 'major', 'academicYear', 'teamName'];
    const emptyFields = requiredFields.filter(field => !formData[field].trim());

    if (emptyFields.length > 0) {
      alert(`Please fill in all required fields.`);
      return;
    }

    // C. PREPARE PAYLOAD
    const teamPayload = {
      name: formData.teamName,
      isOpenToJoin: formData.lookingForMembers,
      project: {
        title: `${formData.teamName} Project`,
        description: formData.projectIdea || "No description provided",
      },
      leader: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        college: formData.college
      },
      members: members.map(m => ({
        name: m.name,
        email: m.email,
        status: 'pending'
      }))
    };

    console.log("✅ Form Valid! Payload:", teamPayload);
    alert("Registration Successful! (Check Console for Payload)");
  };

  return (
    <div className="register-page-wrapper">
      
      {/* HEADER */}
      <div className="register-header">
        <div className="header-content">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            <span>←</span> Back to Details
          </button>
          <h1 className="reg-title">Register for AI Innovation Challenge 2026</h1>
          <p className="reg-subtitle">Create your team and start your journey</p>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="register-form-container">
        <form onSubmit={handleSubmit}>

          {/* --- STEP 1: PERSONAL INFO --- */}
          <div className="step-card">
            <div className="step-header">
              <div className="step-circle">1</div>
              <h2 className="step-label">Personal Information</h2>
            </div>
            
            <div className="input-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  name="fullName" 
                  placeholder="Enter your full name" 
                  value={formData.fullName}
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="your.email@example.com" 
                  value={formData.email}
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              {/* PHONE INPUT - RESTRICTED TO NUMBERS */}
              <div className="form-group">
                <label>Phone Number *</label>
                <input 
                  type="text" 
                  name="phone" 
                  placeholder="10 digit mobile number" 
                  value={formData.phone}
                  onChange={handleChange} 
                  required 
                  maxLength={10} // Browser hint
                />
              </div>

              <div className="form-group">
                <label>College/University *</label>
                <input 
                  type="text" 
                  name="college" 
                  placeholder="Institution name" 
                  value={formData.college}
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Major/Field of Study *</label>
                <input 
                  type="text" 
                  name="major" 
                  placeholder="e.g., Computer Science" 
                  value={formData.major}
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Academic Year *</label>
                <select 
                  name="academicYear" 
                  value={formData.academicYear} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select year</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
            </div>
          </div>

          {/* --- STEP 2: TEAM DETAILS --- */}
          <div className="step-card">
            <div className="step-header">
              <div className="step-circle">2</div>
              <h2 className="step-label">Team Details</h2>
            </div>

            <div className="input-grid">
              <div className="form-group input-full">
                <label>Team Name *</label>
                <input 
                  type="text" 
                  name="teamName" 
                  placeholder="Choose a unique team name" 
                  value={formData.teamName}
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group input-full">
                <label>Project Idea (Optional)</label>
                <textarea 
                  name="projectIdea" 
                  placeholder="Briefly describe your project idea or focus area..." 
                  value={formData.projectIdea}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="input-full">
                <div className="toggle-box">
                  <input 
                    type="checkbox" 
                    name="lookingForMembers" 
                    checked={formData.lookingForMembers}
                    onChange={handleChange} 
                  />
                  <div className="toggle-text">
                    <strong>We're looking for team members</strong>
                    <span>Your team will be visible to others who want to join</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- STEP 3: ADD MEMBERS --- */}
          <div className="step-card">
            <div className="step-header">
              <div className="step-circle">3</div>
              <h2 className="step-label">Add Team Members (Optional)</h2>
            </div>

            <div className="members-header-row">
              <span className="member-count">Team Members: {members.length}/3</span>
              <button type="button" className="add-member-btn" onClick={handleAddMember}>
                + Add Member
              </button>
            </div>

            {members.map((member, index) => (
              <div key={index} className="member-row">
                <div className="form-group">
                  <label>Member Name</label>
                  <input 
                    type="text" 
                    placeholder="Name" 
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Member Email</label>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                  />
                </div>
                <button type="button" className="remove-btn" onClick={() => handleRemoveMember(index)}>
                  ✕
                </button>
              </div>
            ))}

            <div className="warning-box">
              <span>⚠️</span>
              <p style={{margin:0}}>You can add up to 3 additional team members now or invite them later from your dashboard.</p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="form-footer">
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Complete Registration
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegisterHackathon;