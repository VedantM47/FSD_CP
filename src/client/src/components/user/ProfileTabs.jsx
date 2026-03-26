const staticTabs = ["Overview", "Hackathons", "Teams", "Submissions", "Invitations", "Settings"];

const ProfileTabs = ({ activeTab, setActiveTab, invitationCount = 0 }) => {
  return (
    <div className="profile-tabs">
      {staticTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`profile-tabs__btn ${activeTab === tab ? "profile-tabs__btn--active" : ""}`}
          style={{ position: 'relative' }}
        >
          {tab}
          {tab === 'Invitations' && invitationCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#f59e0b',
              display: 'inline-block',
            }} />
          )}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;