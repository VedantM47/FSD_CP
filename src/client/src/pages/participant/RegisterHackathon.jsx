import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { registerTeam, searchUsers } from '../../services/api'; 
import '../../styles/RegisterHackathon.css';

const RegisterHackathon = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // FORM STATE
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', college: '', major: '', academicYear: '',
    teamName: '', projectIdea: '', lookingForMembers: true
  });

  // Redirect if already registered
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const { getAuthHeaders } = await import('../../services/api');
        const API = (await import('../../services/api')).default;
        const res = await API.get('/users/me', getAuthHeaders());
        const userData = res.data?.data || res.data;
        const isParticipant = userData.hackathonRoles?.some(
          role => String(role.hackathonId) === String(id) && role.role === 'participant'
        );
        if (isParticipant) {
          navigate(`/user/hackathon/${id}`, { replace: true });
        }
      } catch (err) {
        console.error("Failed to check registration status", err);
      }
    };
    checkRegistration();
  }, [id, navigate]);

  // SEARCH & MEMBER STATE
  const [members, setMembers] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- HANDLE INPUTS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'phone') {
      const numeric = value.replace(/[^0-9]/g, '');
      if (numeric.length <= 10) setFormData(prev => ({ ...prev, [name]: numeric }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // --- SEARCH LOGIC (Debounced) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const { data } = await searchUsers(searchQuery);
          setSearchResults(data.data); 
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Add Member
  const addMember = (user) => {
    if (members.some(m => m._id === user._id)) {
      alert("User already added!");
      return;
    }
    if (members.length >= 3) {
      alert("Max 3 additional members allowed.");
      return;
    }
    setMembers([...members, user]);
    setSearchQuery(''); 
    setSearchResults([]); 
  };

  const removeMember = (userId) => {
    setMembers(members.filter(m => m._id !== userId));
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) return alert("Phone must be 10 digits.");

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.teamName,
        hackathonId: id,
        projectDescription: formData.projectIdea,
        isOpenToJoin: formData.lookingForMembers,
        // Send IDs to backend
        members: members.map(m => m._id) 
      };

      await registerTeam(payload);
      alert("✅ Team Registered! Invites sent.");
      navigate(`/user/hackathon/${id}`);

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Registration Failed";
      if(msg.includes('duplicate')) alert("You are already in a team!");
      else alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-header">
        <div className="header-content">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}><span>←</span> Back</button>
          <h1 className="reg-title">Register Team</h1>
        </div>
      </div>

      <div className="register-form-container">
        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: Personal Info */}
          <div className="step-card">
            <div className="step-header"><div className="step-circle">1</div><h2 className="step-label">Personal Information</h2></div>
            <div className="input-grid">
              <div className="form-group"><label>Full Name</label><input name="fullName" value={formData.fullName} onChange={handleChange} required /></div>
              <div className="form-group"><label>Email</label><input name="email" value={formData.email} onChange={handleChange} required /></div>
              <div className="form-group"><label>Phone</label><input name="phone" value={formData.phone} onChange={handleChange} required maxLength={10} /></div>
              <div className="form-group"><label>College</label><input name="college" value={formData.college} onChange={handleChange} required /></div>
              <div className="form-group"><label>Major</label><input name="major" value={formData.major} onChange={handleChange} required /></div>
              <div className="form-group"><label>Year</label>
                <select name="academicYear" value={formData.academicYear} onChange={handleChange} required>
                  <option value="">Select Year</option><option>Freshman</option><option>Sophomore</option><option>Junior</option><option>Senior</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: Team Details */}
          <div className="step-card">
            <div className="step-header"><div className="step-circle">2</div><h2 className="step-label">Team Details</h2></div>
            <div className="input-grid">
              <div className="form-group input-full"><label>Team Name</label><input name="teamName" value={formData.teamName} onChange={handleChange} required /></div>
              <div className="form-group input-full"><label>Project Idea (Optional)</label><textarea name="projectIdea" value={formData.projectIdea} onChange={handleChange}></textarea></div>
              <div className="input-full"><div className="toggle-box"><input type="checkbox" name="lookingForMembers" checked={formData.lookingForMembers} onChange={handleChange} /><div className="toggle-text"><strong>Looking for members?</strong><span>Your team will be visible to others.</span></div></div></div>
            </div>
          </div>

          {/* STEP 3: Invite Members (GitHub Style) */}
          <div className="step-card">
            <div className="step-header"><div className="step-circle">3</div><h2 className="step-label">Invite Team Members</h2></div>

            <div className="member-search-box" style={{position:'relative', marginBottom:'20px'}}>
              <label style={{fontSize:'0.9rem', fontWeight:'600', marginBottom:'8px', display:'block'}}>Search by Name or Email</label>
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{width:'100%', padding:'12px', borderRadius:'6px', border:'1px solid #D1D5DB'}}
              />
              
              {/* Dropdown */}
              {searchResults.length > 0 && (
                <div className="search-results-dropdown" style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, 
                  background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto'
                }}>
                  {searchResults.map(user => (
                    <div key={user._id} onClick={() => addMember(user)} style={{
                        padding: '12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#3B82F6', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        {user.fullName.charAt(0)}
                      </div>
                      <div><div style={{fontWeight:'600'}}>{user.fullName}</div><div style={{fontSize:'0.8rem', color:'#6B7280'}}>{user.email}</div></div>
                      <span style={{marginLeft:'auto', color:'#3B82F6'}}>+ Add</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected List */}
            {members.map((m) => (
              <div key={m._id} className="member-row" style={{
                display:'flex', alignItems:'center', gap:'12px', background:'#F3F4F6', padding:'10px', borderRadius:'8px', marginBottom:'8px'
              }}>
                 <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#10B981', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>{m.fullName.charAt(0)}</div>
                  <div style={{flex:1}}><div style={{fontWeight:'600'}}>{m.fullName}</div><div style={{fontSize:'0.8rem', color:'#6B7280'}}>{m.email}</div></div>
                  <div style={{fontSize:'0.8rem', background:'#FEF3C7', color:'#D97706', padding:'2px 8px', borderRadius:'12px'}}>Pending</div>
                  <button type="button" onClick={() => removeMember(m._id)} style={{border:'none', background:'none', color:'#EF4444', cursor:'pointer', fontWeight:'bold'}}>✕</button>
              </div>
            ))}
          </div>

          <div className="form-footer">
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>{isSubmitting ? 'Registering...' : 'Complete Registration'}</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegisterHackathon;