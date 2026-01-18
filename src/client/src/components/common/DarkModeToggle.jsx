import { useEffect, useState } from "react";

const DarkModeToggle = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="px-3 py-1 rounded-md text-sm
        bg-gray-200 dark:bg-gray-700
        text-gray-800 dark:text-gray-200"
    >
      {dark ? "☀ Light" : "🌙 Dark"}
    </button>
  );
};

export default DarkModeToggle;