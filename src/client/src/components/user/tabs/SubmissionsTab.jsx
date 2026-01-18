import submissions from "../../../data/submissions";

const FeedbackBadge = ({ status }) => {
  if (status === "available") {
    return (
      <span className="flex items-center gap-2 text-green-600 font-medium">
        <span className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center">
          ✓
        </span>
        Available
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 text-yellow-600 font-medium">
      <span className="w-4 h-4 rounded-full border-2 border-yellow-500 flex items-center justify-center">
        ⏳
      </span>
      Pending
    </span>
  );
};

const SubmissionsTab = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 text-left">Hackathon</th>
              <th className="px-6 py-4 text-left">Round</th>
              <th className="px-6 py-4 text-left">Submission Link</th>
              <th className="px-6 py-4 text-left">Score</th>
              <th className="px-6 py-4 text-left">Feedback Status</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {submissions.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-blue-700">
                  {item.hackathon}
                </td>

                <td className="px-6 py-4 text-gray-700">
                  {item.round}
                </td>

                <td className="px-6 py-4">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {item.link.replace("https://", "")}
                    <span>↗</span>
                  </a>
                </td>

                <td className="px-6 py-4 font-medium">
                  {item.score}
                </td>

                <td className="px-6 py-4">
                  <FeedbackBadge status={item.feedback} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionsTab;