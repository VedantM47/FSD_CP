const ProfileTabs = ({ activeTab, setActiveTab }) => {
  const tabs = ["Overview", "Hackathons",  "Teams","Submissions", "Settings"];

  return (
    <div className="flex gap-6 border-b mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 text-sm rounded-md transition ${
  activeTab === tab
    ? "bg-blue-50 text-blue-600 border border-blue-600"
    : "bg-white text-gray-600 hover:bg-gray-100"
}`}
        >
        

          {tab}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;