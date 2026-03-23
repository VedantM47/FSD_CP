import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getParticipantDashboard } from '../../services/api';

const ParticipantDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getParticipantDashboard(id);
        if (res.data?.success) {
          setData(res.data.data);
        } else {
          setError('Failed to load dashboard.');
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [id]);

  // Countdown Logic
  useEffect(() => {
    if (!data?.countdown?.date) return;

    const targetDate = new Date(data.countdown.date).getTime();

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(intervalId);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [data]);

  if (loading) return <div style={styles.center}>Loading dashboard...</div>;
  if (error) return <div style={{ ...styles.center, color: '#ef4444' }}>{error}</div>;
  if (!data) return <div style={styles.center}>Dashboard unavailable.</div>;

  const { hackathon, user, team, project, countdown, checklist } = data;

  return (
    <div style={styles.container}>
      {/* Alert Banner for incomplete profile */}
      {!user.isProfileComplete && (
        <div style={styles.alertBanner}>
          <div style={styles.alertContent}>
            <strong>Complete Your Profile to Participate</strong>
            <span>You need to complete your profile before creating or joining a team to match with the best hackers out there.</span>
          </div>
          <Link to="/profile" style={styles.alertButton}>Complete Profile Now</Link>
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>Welcome back!</h1>
        <p style={styles.subtitle}>Here is your {hackathon.title} journey overview.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to={`/user/hackathon/${hackathon.id}`} style={styles.detailsLink}>View Hackathon Details &rarr;</Link>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <Link to={`/hackathon/${hackathon.id}/discussion`} style={styles.detailsLink}>Join Discussion 💬</Link>
        </div>
      </div>

      <div style={styles.grid}>

        {/* === LEFT COLUMN: Stats === */}
        <div style={styles.statsColumn}>

          {/* Main Countdown Card */}
          <div style={{ ...styles.card, ...styles.countdownCard }}>
            <h3 style={styles.cardTitle}>{countdown.name} In</h3>
            <div style={styles.timerDisplay}>
              <div style={styles.timeBox}>
                <span style={styles.timeNumber}>{String(timeLeft.days).padStart(2, '0')}</span>
                <span style={styles.timeLabel}>Days</span>
              </div>
              <span style={styles.timeDivider}>:</span>
              <div style={styles.timeBox}>
                <span style={styles.timeNumber}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span style={styles.timeLabel}>Hours</span>
              </div>
              <span style={styles.timeDivider}>:</span>
              <div style={styles.timeBox}>
                <span style={styles.timeNumber}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span style={styles.timeLabel}>Min</span>
              </div>
              <span style={styles.timeDivider}>:</span>
              <div style={styles.timeBox}>
                <span style={styles.timeNumber}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span style={styles.timeLabel}>Sec</span>
              </div>
            </div>
          </div>

          <div style={styles.statsGrid}>
            {/* Team Members */}
            <div style={styles.card}>
              <h4 style={styles.statLabel}>Team Members</h4>
              <div style={styles.statValue}>
                {team ? `${team.memberCount}/${team.maxSize}` : 'No Team'}
              </div>
              <div style={styles.statAction}>
                {team ? (
                  <Link to={`/user/hackathon/${hackathon.id}/manage-team`} style={styles.linkAction}>Manage Team</Link>
                ) : (
                  <Link to={`/user/hackathon/${hackathon.id}/jointeam`} style={styles.linkAction}>Join/Create Team</Link>
                )}
              </div>
            </div>

            {/* Project Status */}
            <div style={styles.card}>
              <h4 style={styles.statLabel}>Project Status</h4>
              <div style={styles.statValue}>
                {project.statusLabel === 'Not Started' ? (
                  <span style={styles.badgeGray}>Not Started</span>
                ) : project.statusLabel === 'Draft' ? (
                  <span style={styles.badgeYellow}>Draft</span>
                ) : (
                  <span style={styles.badgeGreen}>Submitted</span>
                )}
              </div>
              <div style={styles.statAction}>
                <Link to={`/user/hackathon/${hackathon.id}/submit`} style={styles.linkAction}>View Submission</Link>
              </div>
            </div>

            {/* Finale Date */}
            <div style={styles.card}>
              <h4 style={styles.statLabel}>Finale Date</h4>
              <div style={styles.statValue}>
                {hackathon.resultDate ? new Date(hackathon.resultDate).toLocaleDateString() : 'TBA'}
              </div>
            </div>

            {/* Status */}
            <div style={styles.card}>
              <h4 style={styles.statLabel}>Hackathon Status</h4>
              <div style={styles.statValue}>
                <span style={styles.badgeBlue}>{hackathon.status.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>


        {/* === RIGHT COLUMN: Checklist & Timeline === */}
        <div style={styles.infoColumn}>

          {/* Checklist Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Participant Checklist</h3>
            <ul style={styles.checklist}>
              <li style={styles.checkItem}>
                <div style={checklist.step1 ? styles.checkCircleDone : styles.checkCirclePending}>
                  {checklist.step1 && <span style={styles.checkmark}>✓</span>}
                </div>
                <div style={styles.checkText}>
                  <p style={checklist.step1 ? styles.checkTextDone : styles.checkTextPending}>Complete Your Profile</p>
                  {!checklist.step1 && <Link to="/profile" style={styles.checkLink}>Go to Profile</Link>}
                </div>
              </li>

              <li style={styles.checkItem}>
                <div style={checklist.step2 ? styles.checkCircleDone : styles.checkCirclePending}>
                  {checklist.step2 && <span style={styles.checkmark}>✓</span>}
                </div>
                <div style={styles.checkText}>
                  <p style={checklist.step2 ? styles.checkTextDone : styles.checkTextPending}>Form Your Team</p>
                  {!checklist.step2 && <Link to={`/user/hackathon/${hackathon.id}/jointeam`} style={styles.checkLink}>Find or create a team</Link>}
                </div>
              </li>

              <li style={styles.checkItem}>
                <div style={checklist.step3 ? styles.checkCircleDone : styles.checkCirclePending}>
                  {checklist.step3 && <span style={styles.checkmark}>✓</span>}
                </div>
                <div style={styles.checkText}>
                  <p style={checklist.step3 ? styles.checkTextDone : styles.checkTextPending}>Create Your Project Draft</p>
                  {!checklist.step3 && checklist.step2 && <Link to={`/user/hackathon/${hackathon.id}/submit`} style={styles.checkLink}>Start drafting</Link>}
                </div>
              </li>

              <li style={styles.checkItem}>
                <div style={checklist.step4 ? styles.checkCircleDone : styles.checkCirclePending}>
                  {checklist.step4 && <span style={styles.checkmark}>✓</span>}
                </div>
                <div style={styles.checkText}>
                  <p style={checklist.step4 ? styles.checkTextDone : styles.checkTextPending}>Submit Final Project</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Event Timeline Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Event Timeline</h3>
            <div style={styles.timeline}>
              <div style={styles.timelineItem}>
                <div style={styles.timelineDotActive}></div>
                <div style={styles.timelineContent}>
                  <strong>Registration Closes</strong>
                  <span>{hackathon.registrationDeadline ? new Date(hackathon.registrationDeadline).toLocaleString() : 'TBA'}</span>
                </div>
              </div>
              <div style={styles.timelineItem}>
                <div style={styles.timelineDot}></div>
                <div style={styles.timelineContent}>
                  <strong>Prototype Submission</strong>
                  <span>{hackathon.prototypeDeadline ? new Date(hackathon.prototypeDeadline).toLocaleString() : 'TBA'}</span>
                </div>
              </div>
              <div style={styles.timelineItem}>
                <div style={styles.timelineDot}></div>
                <div style={styles.timelineContent}>
                  <strong>Grand Finale & Results</strong>
                  <span>{hackathon.resultDate ? new Date(hackathon.resultDate).toLocaleString() : 'TBA'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* Styles mimicking the clean, modern video aesthetic */
const styles = {
  center: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#6b7280', fontFamily: 'Inter, sans-serif'
  },
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '2rem',
    fontFamily: '"Inter", sans-serif',
  },
  alertBanner: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  alertContent: {
    display: 'flex',
    flexDirection: 'column',
    color: '#b45309',
    fontSize: '0.95rem',
  },
  alertButton: {
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s',
  },
  header: {
    marginBottom: '2.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748b',
    margin: '0 0 0.5rem 0',
  },
  detailsLink: {
    fontSize: '0.9rem',
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '2rem',
    alignItems: 'start',
  },
  statsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  infoColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.75rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  },
  countdownCard: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#ffffff',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: '0 0 1.5rem 0',
    color: 'inherit',
  },
  timerDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },
  timeBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '60px',
  },
  timeNumber: {
    fontSize: '3rem',
    fontWeight: '800',
    fontFeatureSettings: '"tnum"',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '1',
  },
  timeLabel: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#94a3b8',
    marginTop: '0.5rem',
  },
  timeDivider: {
    fontSize: '3rem',
    fontWeight: '300',
    color: '#475569',
    marginTop: '-1.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  statLabel: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    margin: '0 0 0.5rem 0',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.5rem',
  },
  statAction: {
    marginTop: 'auto',
  },
  linkAction: {
    fontSize: '0.85rem',
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
  },
  badgeGray: {
    backgroundColor: '#f1f5f9', color: '#64748b', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem',
  },
  badgeYellow: {
    backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem',
  },
  badgeGreen: {
    backgroundColor: '#dcfce3', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem',
  },
  badgeBlue: {
    backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem',
  },
  checklist: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  checkCircleDone: {
    width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ffffff', flexShrink: 0, marginTop: '2px',
  },
  checkCirclePending: {
    width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #cbd5e1', backgroundColor: '#f8fafc', flexShrink: 0, marginTop: '2px',
  },
  checkmark: {
    fontSize: '14px', fontWeight: 'bold',
  },
  checkText: {
    display: 'flex', flexDirection: 'column',
  },
  checkTextDone: {
    margin: 0, fontSize: '1rem', fontWeight: '500', color: '#94a3b8', textDecoration: 'line-through',
  },
  checkTextPending: {
    margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0f172a',
  },
  checkLink: {
    fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'none', marginTop: '0.25rem',
  },
  timeline: {
    display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative',
    borderLeft: '2px solid #e2e8f0', marginLeft: '10px', paddingLeft: '20px',
  },
  timelineItem: {
    display: 'flex', flexDirection: 'column', position: 'relative',
  },
  timelineDotActive: {
    position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6', border: '2px solid #ffffff',
  },
  timelineDot: {
    position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#cbd5e1', border: '2px solid #ffffff',
  },
  timelineContent: {
    display: 'flex', flexDirection: 'column', gap: '0.25rem',
  },
  '@media (max-width: 1024px)': {
    grid: { gridTemplateColumns: '1fr' }
  }
};

export default ParticipantDashboard;
