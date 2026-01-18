const ProfileHeader = ({ user }) => {
  return (
    <div className="bg-white rounded-xl p-6 flex justify-between items-center mb-6">
      <div className="flex gap-4">
        <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-semibold">
          {user.name[0]}
        </div>

        <div>
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-500">{user.college}</p>
          <p className="text-sm text-gray-500">{user.course}</p>
          <p className="text-sm text-gray-500">{user.location}</p>
        </div>
      </div>

      <div className="flex gap-8 text-center">
        <div>
          <p className="text-xl font-bold text-indigo-600">
            {user.stats.hackathons}
          </p>
          <p className="text-sm text-gray-500">Hackathons</p>
        </div>
        <div>
          <p className="text-xl font-bold text-indigo-600">
            {user.stats.wins}
          </p>
          <p className="text-sm text-gray-500">Wins</p>
        </div>
        <div>
          <p className="text-xl font-bold text-indigo-600">
            {user.stats.active}
          </p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;