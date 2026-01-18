const statusColor = (status) => {
  switch (status) {
    case "Completed":
      return "text-green-600";
    case "In Progress":
      return "text-blue-600";
    case "Registered":
      return "text-gray-500";
    default:
      return "text-gray-600";
  }
};

const HackathonTableRow = ({ hackathon }) => {
  return (
    <tr className="border-b last:border-none">
      <td className="py-3 font-medium text-gray-800">
        {hackathon.name}
      </td>

      <td className="py-3 text-gray-600">
        {hackathon.role}
      </td>

      <td className={`py-3 font-medium ${statusColor(hackathon.status)}`}>
        {hackathon.status}
      </td>

      <td className="py-3 text-gray-600">
        {hackathon.result}
      </td>

      <td className="py-3 text-blue-600 cursor-pointer">
        ↗
      </td>
    </tr>
  );
};

export default HackathonTableRow;