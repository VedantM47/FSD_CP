const ActivityTimeline = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
            {i !== items.length - 1 && (
              <span className="w-px bg-gray-300 flex-1" />
            )}
          </div>

          <div>
            <p className="text-sm">{item.text}</p>
            <p className="text-xs text-gray-400">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;