const tabs = ["Overview", "Hackathons", "Teams", "Submissions", "Settings"];

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="profile-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`profile-tabs__btn ${activeTab === tab ? "profile-tabs__btn--active" : ""
            }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;