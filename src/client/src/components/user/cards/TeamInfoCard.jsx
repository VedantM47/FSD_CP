
const TeamInfoCard = ({ team }) => {
  return (
<div className="bg-white rounded-xl p-6 w-full lg:max-w-lg">
      <h3 className="font-semibold mb-3">Team Information</h3>

      <p className="font-medium">{team.name}</p>

      <ul className="mt-3 space-y-1 text-sm text-gray-600">
        {team.members.map((m, i) => (
          <li key={i}>
            {m.leader ? "👑" : "👤"} {m.name}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm">Looking for members</span>
        <input type="checkbox" defaultChecked={team.open} />
      </div>
    </div>
  );
};

export default TeamInfoCard;