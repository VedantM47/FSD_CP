const ActivityItem = ({ text }) => (
<div className="
  flex items-start gap-3 p-4 rounded-lg
  bg-slate-800 text-white
  hover:bg-slate-700 transition
">
    <span className="w-2 h-2 mt-2 rounded-full bg-indigo-500"></span>
    <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
  </div>
);

export default ActivityItem;