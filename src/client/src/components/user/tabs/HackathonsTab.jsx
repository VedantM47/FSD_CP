import HackathonTableRow from "../table/HackathonTableRow";
import { hackathonsList } from "../../../data/hackathons.mock";

const HackathonsTab = () => {
  return (
    <div className="bg-white rounded-xl p-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-3">HACKATHON NAME</th>
            <th className="pb-3">ROLE</th>
            <th className="pb-3">STATUS</th>
            <th className="pb-3">RESULT</th>
            <th className="pb-3">ACTION</th>
          </tr>
        </thead>

        <tbody>
          {hackathonsList.map((hackathon) => (
            <HackathonTableRow
              key={hackathon.id}
              hackathon={hackathon}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HackathonsTab;