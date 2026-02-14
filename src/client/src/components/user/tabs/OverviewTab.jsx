import HackathonCard from "../cards/HackathonCard";
import ActivityItem from "../cards/ActivityItem";

const OverviewTab = ({ user }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left: Active Hackathons */}
    <div className="lg:col-span-2 bg-white rounded-xl p-6">
      <h3 className="font-semibold mb-4">Active Hackathons</h3>
      <div className="space-y-4">
        {user.activeHackathons.map(h => (
          <HackathonCard key={h.id} hackathon={h} light />
        ))}
      </div>
    </div>

    {/* Right: Recent Activity */}
    <div className="bg-white rounded-xl p-6">
      <h3 className="font-semibold mb-4">Recent Activity</h3>
      <ActivityTimeline items={user.activity} />
    </div>
  </div>
  );
};

export default OverviewTab;