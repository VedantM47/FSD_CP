const Navbar = () => {
  return (
    <div className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between">
      <h1 className="font-semibold text-lg">Hackplatform</h1>

      <input
        placeholder="Search hackathons"
        className="w-1/3 px-4 py-2 rounded-md text-black text-sm"
      />

      <div className="flex items-center gap-4">
        <span>🔔</span>
        <div className="w-8 h-8 bg-white text-blue-900 rounded-full flex items-center justify-center font-semibold">
          S
        </div>
      </div>
    </div>
  );
};

export default Navbar;