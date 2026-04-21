const TeamCard = ({ team }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">

      {/* ===== Header ===== */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">
            {team.name}
          </h3>
        </div>

        {team.isLeader && (
          <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-md font-medium">
            Leader
          </span>
        )}
      </div>

      {/* Hackathon Name */}
      <p className="text-sm text-gray-500 mt-2">
        {team.hackathon}
      </p>

      {/* Divider */}
      <hr className="my-4" />

      {/* ===== Footer Row ===== */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            Members: <span className="font-medium">{team.members}</span>
          </span>

          <span
            className={`font-medium ${
              team.status === "Active"
                ? "text-blue-600"
                : "text-green-600"
            }`}
          >
            {team.status}
          </span>
        </div>

        {/* View Team */}
        <button className={`px-4 py-2 text-sm rounded-md transition ${"bg-blue-50 text-blue-600 border border-blue-600"}`}>
          View Team
        </button>
      </div>
    </div>
  );
};

export default TeamCard;