import { Link } from 'react-router-dom';

const ProfileHeader = ({ user, stats }) => {
  const initial = user?.fullName?.[0]?.toUpperCase() || "?";

  return (
    <div className="profile-header">
      <div className="profile-header__left">
        <div className="profile-header__avatar">{initial}</div>

        <div className="profile-header__info">
          <h2>{user.fullName}</h2>
          <p>
            <span className="icon">@</span> {user.email}
          </p>
          {user.college && <p>{user.college}</p>}
          {user.department && <p>{user.department}</p>}
          {user.year && <p><span className="icon">📍</span> {user.year}</p>}
        </div>
      </div>

      <div className="profile-header__stats">
        <div className="stat-card">
          <p className="stat-card__value">
            {stats?.hackathonsParticipated ?? 0}
          </p>
          <p className="stat-card__label">Hackathons Participated</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__value">{stats?.wins ?? 0}</p>
          <p className="stat-card__label">Wins / Top Finishes</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__value">{stats?.activeHackathons ?? 0}</p>
          <p className="stat-card__label">Active Hackathons</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
