const HackathonCard = ({ hackathon }) => {
  return (
    <div className="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <h4 className="font-medium">{hackathon.title}</h4>
        <p className="text-sm text-gray-500">{hackathon.organizer}</p>
        <p className="text-sm text-gray-500">
          Current Round: {hackathon.round}
        </p>
        <p className="text-sm text-gray-500">Deadline: {hackathon.deadline}</p>
      </div>

      <div className="flex gap-2">
        <button
          className={`px-4 py-2 text-sm rounded-md transition ${"bg-blue-50 text-blue-600 border border-blue-600"}`}
        >
          Submit
        </button>
        <button 
          className={`px-4 py-2 text-sm rounded-md transition ${"bg-blue-50 text-blue-600 border border-blue-600"}`}
        >
          View Hackathon
        </button>
      </div>
    </div>
  );
};

export default HackathonCard;
