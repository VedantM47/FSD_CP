import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Hero from "../../components/user/Hero";
import FilterBar from "../../components/user/FilterBar";
import HackathonCard from "../../components/user/cards/HackathonCard";
import Footer from "../../components/common/Footer";
import API from "../../services/api";
import "../../styles/discovery.css";

/* ── Map backend hackathon → shape HackathonCard expects ── */
const toCardShape = (h) => ({
  _id: h._id,
  name: h.title,
  organization: "HackathonHub", // backend has no org field yet
  description: h.description || "No description provided.",
  image: h.image || `https://picsum.photos/seed/${h._id}/600/300`,
  status: h.status,
  teamSize: h.maxTeamSize ? `1–${h.maxTeamSize}` : "Open",
  mode: "Online", // backend has no mode field yet
  deadline: h.registrationDeadline
    ? new Date(h.registrationDeadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : h.endDate
      ? new Date(h.endDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "TBD",
  prizePool: h.prizePool || "TBA",
  // derive tags from status so FilterBar can filter
  tags: [h.status],
});

const Discovery = () => {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = React.useState("All");
  const [allHackathons, setAllHackathons] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [visibleCount, setVisibleCount] = React.useState(6);

  /* ── Fetch ── */
  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get("/hackathons");
        const raw = res.data?.data ?? [];
        setAllHackathons(raw.map(toCardShape));
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load hackathons.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── Filter ── */
  const filteredHackathons = React.useMemo(() => {
    if (activeFilter === "All") return allHackathons;
    return allHackathons.filter((h) =>
      h.tags.some((tag) => tag.toLowerCase() === activeFilter.toLowerCase()),
    );
  }, [activeFilter, allHackathons]);

  const visibleHackathons = filteredHackathons.slice(0, visibleCount);
  const hasMore = visibleCount < filteredHackathons.length;

  const handleFilterChange = (f) => {
    setActiveFilter(f);
    setVisibleCount(6); // reset pagination on filter change
  };

  return (
    <div className="discovery-container">
      <Navbar />
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />
      <Hero />

      <main className="hackathon-grid">
        {/* Loading */}
        {loading && (
          <div className="empty-state-message">
            <p>Loading hackathons…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="empty-state-message">
            <p>⚠️ {error}</p>
            <button
              className="btn-secondary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Cards */}
        {!loading &&
          !error &&
          visibleHackathons.map((hackathon) => (
            <HackathonCard
              key={hackathon._id}
              hackathon={hackathon}
              onRegister={() =>
                navigate(`/user/hackathon/${hackathon._id}/register`)
              }
              onViewDetails={() => navigate(`/user/hackathon/${hackathon._id}`)}
            />
          ))}

        {/* Empty */}
        {!loading && !error && filteredHackathons.length === 0 && (
          <div className="empty-state-message">
            <p>No hackathons found matching "{activeFilter}".</p>
            <button
              className="btn-secondary"
              onClick={() => setActiveFilter("All")}
            >
              Clear Filter
            </button>
          </div>
        )}
      </main>

      {/* Load More */}
      {!loading && hasMore && (
        <div className="load-more-container">
          <button
            className="load-more-btn"
            onClick={() => setVisibleCount((c) => c + 6)}
          >
            Load More Hackathons
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Discovery;
