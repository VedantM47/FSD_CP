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
      <Link to="/" style={styles.backLink}>&larr; Back to Home</Link>

      <div style={styles.grid}>
        {/* Left Column - User Identity */}
        <div style={styles.identityCard}>
          <div style={styles.avatarContainer}>
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.fullName} style={styles.avatar} />
            ) : (
              <div style={styles.avatarFallback}>
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 style={styles.name}>{user.fullName}</h1>
          {user.bio && <p style={styles.bio}>{user.bio}</p>}

          <div style={styles.socialLinks}>
            {user.github && (
              <a href={user.github} target="_blank" rel="noreferrer" style={styles.btnGithub}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                GitHub
              </a>
            )}
            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noreferrer" style={styles.btnLinkedin}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                LinkedIn
              </a>
            )}
            {user.resumeUrl && (
              <a href={user.resumeUrl} target="_blank" rel="noreferrer" style={styles.btnResume}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Resume
              </a>
            )}
          </div>
        </div>

        {/* Right Column - Details Grid */}
        <div style={styles.detailsGrid}>
          {/* Education Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>🎓</span> Education
            </div>

            <div style={styles.infoRow}>
              <div style={styles.infoLabel}>College/Organization</div>
              <div style={styles.infoValue}>{user.college || 'Not specified'}</div>
            </div>
            <div style={styles.infoRow}>
              <div style={styles.infoLabel}>Degree</div>
              <div style={styles.infoValue}>{user.degree || 'Not specified'}</div>
            </div>
            <div style={styles.infoRow}>
              <div style={styles.infoLabel}>Course & Specialization</div>
              <div style={styles.infoValue}>{user.department || 'Not specified'}</div>
            </div>
            <div style={styles.infoRow}>
              <div style={styles.infoLabel}>Current Year / Level</div>
              <div style={styles.infoValue}>{user.year ? `Year ${user.year}` : 'Not specified'}</div>
            </div>
            <div style={styles.infoRow}>
              <div style={styles.infoLabel}>Graduation Year</div>
              <div style={styles.infoValue}>{user.graduationYear || 'Not specified'}</div>
            </div>
          </div>

          {/* Personal Info Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>👤</span> Personal Info
            </div>
            <div style={styles.infoRow}>
              <div style={styles.infoLabel}>Residence</div>
              <div style={styles.infoValue}>{user.residence || 'Not specified'}</div>
            </div>
            <div style={styles.infoRow}>
              <div style={styles.infoLabel}>Gender</div>
              <div style={styles.infoValue}>{user.gender || 'Not specified'}</div>
            </div>
          </div>

          {/* Skills Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>💡</span> Skills
            </div>
            <div style={styles.pillContainer}>
              {user.skills && user.skills.length > 0 ? (
                user.skills.map(skill => (
                  <span key={skill} style={styles.skillPill}>{skill}</span>
                ))
              ) : (
                <div style={styles.infoValue}>No skills listed</div>
              )}
            </div>
          </div>

          {/* Interests Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>❤️</span> Interests
            </div>
            <div style={styles.pillContainer}>
              {user.interests && user.interests.length > 0 ? (
                user.interests.map(interest => (
                  <span key={interest} style={styles.interestPill}>{interest}</span>
                ))
              ) : (
                <div style={styles.infoValue}>No interests listed</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '2rem',
    fontFamily: '"Inter", sans-serif',
  },
  backLink: {
    display: 'inline-block',
    color: '#64748b',
    textDecoration: 'none',
    marginBottom: '2rem',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  grid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(300px, 350px) 1fr',
    gap: '2rem',
    alignItems: 'start',
  },
  identityCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    position: 'sticky',
    top: '2rem',
  },
  avatarContainer: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    border: '4px solid #ffffff',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    marginBottom: '1.5rem',
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
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '4rem',
    color: '#64748b',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
  },
  name: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
  },
  bio: {
    fontSize: '0.95rem',
    color: '#64748b',
    margin: '0 0 1.5rem 0',
    lineHeight: '1.5',
  },
  socialLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
  },
  btnGithub: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: '#18181b',
    color: '#ffffff',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'transform 0.2s',
  },
  btnLinkedin: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: '#0a66c2',
    color: '#ffffff',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'transform 0.2s',
  },
  btnResume: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'background-color 0.2s',
    border: '1px solid #e2e8f0',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.75rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  cardHeader: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cardIcon: {
    fontSize: '1.4rem',
  },
  infoRow: {
    marginBottom: '1.25rem',
  },
  infoLabel: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#94a3b8',
    marginBottom: '0.25rem',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: '1rem',
    color: '#334155',
    fontWeight: '500',
  },
  pillContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  skillPill: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '0.4rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  interestPill: {
    backgroundColor: '#f3e8ff',
    color: '#7e22ce',
    padding: '0.4rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  '@media (max-width: 900px)': {
    grid: {
      gridTemplateColumns: '1fr',
    },
    detailsGrid: {
      gridTemplateColumns: '1fr',
    },
    identityCard: {
      position: 'static',
    }
  }
};

export default PublicProfile;
