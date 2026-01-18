import { useState } from "react";
import Navbar from "../../components/common/Navbar";
import ProfileLayout from "../../components/user/ProfileLayout";
import ProfileHeader from "../../components/user/ProfileHeader";
import ProfileTabs from "../../components/user/ProfileTabs";
import HackathonCard from "../../components/user/cards/HackathonCard";
import ActivityTimeline from "../../components/user/timeline/ActivityTimeline";
import HackathonsTab from "../../components/user/tabs/HackathonsTab";
import TeamInfoCard from "../../components/user/cards/TeamInfoCard";
import { userProfile } from "../../data/userProfile.mock";
import TeamsTab from "../../components/user/tabs/TeamsTab";
import SettingsTab from "../../components/user/tabs/SettingsTab";
import SubmissionsTab from "../../components/user/tabs/SubmissionsTab";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <>
      <Navbar />
      <ProfileLayout>
        <ProfileHeader user={userProfile} />
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "Overview" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl p-6">
                <h3 className="font-semibold mb-4">Active Hackathons</h3>
                <div className="space-y-4">
                  {userProfile.activeHackathons.map((h) => (
                    <HackathonCard key={h.id} hackathon={h} />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <ActivityTimeline items={userProfile.activity} />
              </div>
            </div>

            <div className="mt-6">
              <TeamInfoCard team={userProfile.team} />
            </div>
          </>
        )}
        {activeTab === "Hackathons" && <HackathonsTab />}
        {activeTab === "Teams" && <TeamsTab />}
        {activeTab === "Submissions" && <SubmissionsTab />}
        {activeTab === "Settings" && <SettingsTab />}

      </ProfileLayout>
    </>
  );
};

export default Profile;