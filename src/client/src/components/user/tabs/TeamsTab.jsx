import TeamCard from "../cards/TeamCard";
import { teamsList } from "../../../data/teams.mock";

const TeamsTab = () => {
  return (
    <div className="space-y-6">

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamsList.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>

      {/* Create Team Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800">
            Create a New Team
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Start a team and invite others to collaborate in hackathons
          </p>
        </div>

        <button className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700">
          + Create Team
        </button>
      </div>
    </div>
  );
};

export default TeamsTab;