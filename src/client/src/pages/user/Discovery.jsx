import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Hero from "../../components/user/Hero";
import FilterBar from "../../components/user/FilterBar";
import HackathonCard from "../../components/user/cards/HackathonCard";
import Footer from "../../components/common/Footer";
import API, { getAuthHeaders } from "../../services/api";
import "../../styles/discovery.css";

const Discovery = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // --- STATE ---
  const [activeFilter, setActiveFilter] = useState("All");
  const [allHackathons, setAllHackathons] = useState([]);
  const [userRoles, setUserRoles] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);

  /**
   * ── Map backend hackathon → shape HackathonCard expects ──
   * Includes a robust comparison to handle both hId and hackathonId fields
   */
  const toCardShape = (h) => {
    // ROBUST ID CHECK: We convert everything to String to avoid Object vs String mismatches
    const registrationRecord = userRoles.find((role) => {
      const roleHackathonId = String(role.hId || role.hackathonId || "");
      const currentHackathonId = String(h._id || "");
      
      return roleHackathonId === currentHackathonId && role.role === 'participant';
    });

    const isUserRegistered = !!registrationRecord;

    return {
      _id: h._id,
      name: h.title,
      organization: "HackathonHub", 
      description: h.description || "No description provided.",
      image: h.image || `https://placehold.co/600x300/e2e8f0/475569?text=Hackathon`,
      status: h.status,
      isRegistered: isUserRegistered, // This flag controls the button state
      teamSize: h.maxTeamSize ? `1–${h.maxTeamSize}` : "Open",
      mode: "Online", 
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
      tags: [h.status],
    };
  };

  /* ── Load User Context and Hackathons ── */
  useEffect(() => {
    const loadDiscoveryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch User Data to check which hackathons they are in
        try {
          const userRes = await API.get("/users/me", getAuthHeaders());
          const userData = userRes.data?.data || userRes.data;
          setUserRoles(userData?.hackathonRoles || []);
        } catch (authErr) {
          console.log("Visitor mode: Proceeding without user roles.");
        }

        // 2. Fetch All Hackathons or Search Results
        let endpoint = "/hackathons";
        if (query.trim()) {
          endpoint = `/hackathons/search?q=${encodeURIComponent(query.trim())}`;
        }
        const hackRes = await API.get(endpoint);
        const raw = hackRes.data?.data ?? [];
        setAllHackathons(raw);

      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load hackathons.");
      } finally {
        setLoading(false);
      }
    };
    loadDiscoveryData();
  }, []);

  /* ── Memoized Filtering and Mapping ── */
  const filteredHackathons = useMemo(() => {
    // Map data only when both roles and hackathons are loaded
    const shaped = allHackathons.map(toCardShape);
    
    if (activeFilter === "All") return shaped;
    return shaped.filter((h) =>
      h.tags.some((tag) => tag.toLowerCase() === activeFilter.toLowerCase())
    );
  }, [activeFilter, allHackathons, userRoles]);

  const visibleHackathons = filteredHackathons.slice(0, visibleCount);
  const hasMore = visibleCount < filteredHackathons.length;

  const handleFilterChange = (f) => {
    setActiveFilter(f);
    setVisibleCount(6); 
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
        {loading && (
          <div className="empty-state-message">
            <p>Scanning for hackathons…</p>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state-message">
            <p>⚠️ {error}</p>
            <button className="btn-secondary" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          visibleHackathons.map((hackathon) => (
            <HackathonCard
              key={hackathon._id}
              hackathon={hackathon}
              onRegister={() => {
                  // Direct registered or ongoing users to the dashboard
                  if (hackathon.isRegistered || hackathon.status !== 'open') {
                    navigate(`/user/hackathon/${hackathon._id}`);
                  } else {
                    navigate(`/user/hackathon/${hackathon._id}/register`);
                  }
              }}
              onViewDetails={() => navigate(`/user/hackathon/${hackathon._id}`)}
            />
          ))}

        {!loading && !error && filteredHackathons.length === 0 && (
          <div className="empty-state-message">
            <p>No hackathons match "{activeFilter}".</p>
            <button className="btn-secondary" onClick={() => setActiveFilter("All")}>
              Show All
            </button>
          </div>
        )}
      </main>

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