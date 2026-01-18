const ProfileLayout = ({ children }) => {
  return (
    <div className="bg-slate-100 min-h-screen px-6 py-6">
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
};

export default ProfileLayout;