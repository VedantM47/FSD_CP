import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserPublicProfile } from '../../services/api';

const PublicProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getUserPublicProfile(userId);
        if (res.data?.success) {
          setUser(res.data.data);
        } else {
          setError('Failed to load profile.');
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#6b7280' }}>Loading profile...</div>;
  if (error) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#ef4444' }}>{error}</div>;
  if (!user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#6b7280' }}>Profile unavailable.</div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerNav}>
        <Link to="/" style={styles.backLink}>&larr; Back to Dashboard</Link>
      </div>

      <div style={styles.mainLayout}>
        {/* Top Header Card */}
        <div style={styles.headerCard}>
          <div style={styles.headerTop}>
            <div style={styles.avatarWrapper}>
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.fullName} style={styles.avatar} />
              ) : (
                <div style={styles.avatarFallback}>{user.fullName.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div style={styles.headerInfo}>
              <h1 style={styles.name}>{user.fullName}</h1>
              {user.bio && <p style={styles.bio}>{user.bio}</p>}
              <div style={styles.headerLinks}>
                {user.website && (
                  <a href={user.website} target="_blank" rel="noreferrer" style={styles.linkItem}>
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span style={styles.linkItem}>{user.email}</span>
              </div>
            </div>
          </div>
          
          <div style={styles.headerActions}>
            <div style={styles.socialButtons}>
              {user.github && (
                <a href={user.github} target="_blank" rel="noreferrer" style={styles.btnSocial}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                   GitHub
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noreferrer" style={styles.btnSocial}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                   LinkedIn
                </a>
              )}
            </div>
            {user.resumeUrl && (
              <a href={user.resumeUrl} target="_blank" rel="noreferrer" style={styles.btnResume}>
                View Resume
              </a>
            )}
          </div>
        </div>

        <div style={styles.contentGrid}>
          {/* Left Column */}
          <div style={styles.column}>
            {/* Education Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Education</h3>
              <div style={styles.infoGroup}>
                <InfoItem label="College/University" value={user.college} />
                <div style={styles.row}>
                  <InfoItem label="State" value={user.collegeState} />
                  <InfoItem label="City" value={user.collegeCity} />
                </div>
                <div style={styles.row}>
                  <InfoItem label="Degree" value={user.degree} />
                  <InfoItem label="Graduation Year" value={user.graduationYear} />
                </div>
                <InfoItem label="Major / Specialization" value={user.major} />
              </div>
            </div>

            {/* Personal Info Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Personal Information</h3>
              <div style={styles.infoGroup}>
                <InfoItem label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : null} />
                <InfoItem label="Gender" value={user.gender} />
                <div style={styles.row}>
                  <InfoItem label="State" value={user.state} />
                  <InfoItem label="City" value={user.city} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={styles.column}>
            {/* Skills Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Skills</h3>
              <div style={styles.pillContainer}>
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map(skill => (
                    <span key={skill} style={styles.skillPill}>{skill}</span>
                  ))
                ) : (
                  <p style={styles.emptyText}>No skills listed</p>
                )}
              </div>
            </div>

            {/* Interests Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Interests</h3>
              <div style={styles.pillContainer}>
                {user.interests && user.interests.length > 0 ? (
                  user.interests.map(interest => (
                    <span key={interest} style={styles.interestPill}>{interest}</span>
                  ))
                ) : (
                  <p style={styles.emptyText}>No interests listed</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div style={styles.infoItem}>
    <label style={styles.infoLabel}>{label}</label>
    <div style={styles.infoValue}>{value || <span style={styles.placeholder}>Not specified</span>}</div>
  </div>
);

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    padding: '2rem 1rem',
    fontFamily: '"Inter", sans-serif',
    color: '#1e293b',
  },
  headerNav: {
    maxWidth: '1000px',
    margin: '0 auto 1.5rem',
  },
  backLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  mainLayout: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  headerTop: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  avatarWrapper: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    flexShrink: 0,
    border: '4px solid #f8fafc',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    fontWeight: '700',
    color: '#64748b',
    background: '#f1f5f9',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
  },
  bio: {
    fontSize: '1rem',
    color: '#475569',
    lineHeight: '1.6',
    margin: '0 0 1rem 0',
    maxWidth: '600px',
  },
  headerLinks: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  linkItem: {
    fontSize: '0.9rem',
    color: '#64748b',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  headerActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1.5rem',
    borderTop: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  socialButtons: {
    display: 'flex',
    gap: '1rem',
  },
  btnSocial: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    color: '#334155',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s',
  },
  btnResume: {
    padding: '0.6rem 1.5rem',
    borderRadius: '8px',
    backgroundColor: '#1d4ed8',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'background 0.2s',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '1.5rem',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '1.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '1.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #f1f5f9',
  },
  infoGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  infoLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  infoValue: {
    fontSize: '1rem',
    color: '#334155',
    fontWeight: '500',
  },
  placeholder: {
    color: '#cbd5e1',
    fontStyle: 'italic',
  },
  pillContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  skillPill: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '0.5rem 1.25rem',
    borderRadius: '99px',
    fontSize: '0.85rem',
    fontWeight: '600',
    border: '1px solid #dbeafe',
  },
  interestPill: {
    backgroundColor: '#fff7ed',
    color: '#ea580c',
    padding: '0.5rem 1.25rem',
    borderRadius: '99px',
    fontSize: '0.85rem',
    fontWeight: '600',
    border: '1px solid #ffedd5',
  },
  emptyText: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  '@media (max-width: 768px)': {
    contentGrid: {
      gridTemplateColumns: '1fr',
    },
    headerTop: {
      flexDirection: 'column',
      textAlign: 'center',
    },
    headerLinks: {
      justifyContent: 'center',
    },
    headerActions: {
      justifyContent: 'center',
    }
  }
};

export default PublicProfile;
