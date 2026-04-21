import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import FilterBar from "../../components/user/FilterBar";
import HackathonCard from "../../components/user/cards/HackathonCard";
import Footer from "../../components/common/Footer";
import { API, getAuthHeaders } from "../../services/api";
import { Search } from 'lucide-react';
import "../../styles/discovery.css";

const Discovery = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // --- STATE ---
  const [activeFilter, setActiveFilter] = useState("All");
  const [allHackathons, setAllHackathons] = useState([]);
  const [userRoles, setUserRoles] = useState([]); 
  const [userTeams, setUserTeams] = useState([]); // Track user's teams
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [searchInput, setSearchInput] = useState(query);

  /**
   * ── Map backend hackathon → shape HackathonCard expects ──
   */
  const toCardShape = (h) => {
    // Check if user has participant role for this hackathon
    const registrationRecord = userRoles.find((role) => {
      const roleHackathonId = String(role.hId || role.hackathonId || "");
      const currentHackathonId = String(h._id || "");
      return roleHackathonId === currentHackathonId && role.role === 'participant';
    });

    // ALSO check if user is part of any team for this hackathon (covers invite scenario)
    const teamRecord = userTeams.find(t => String(t.hackathonId) === String(h._id));
    const isInTeam = !!teamRecord;

    const isUserRegistered = !!registrationRecord || isInTeam;

    // FIX: DATE CHECK LOGIC
    // Grab the raw date before we format it into a string
    const rawDeadline = h.registrationDeadline || h.endDate;
    // Check if right now is past the deadline
    const isRegistrationClosed = rawDeadline ? new Date() > new Date(rawDeadline) : false;

    // FIX: Make the badge say "closed" if the deadline passed, even if DB says "open"
    const displayStatus = (h.status === 'open' && isRegistrationClosed) ? 'closed' : h.status;

    return {
      _id: h._id,
      name: h.title,
      organization: "HackathonHub", 
      description: h.description || "No description provided.",
      image: h.image || `https://placehold.co/600x300/e2e8f0/475569?text=Hackathon`,
      status: displayStatus, // Now the badge will correctly show 'closed'
      isRegistered: isUserRegistered,
      isRegistrationClosed: isRegistrationClosed, // Pass this to shut down the button
      teamSize: h.maxTeamSize ? `1–${h.maxTeamSize}` : "Open",
      mode: "Online", 
      deadline: rawDeadline
        ? new Date(rawDeadline).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "TBD",
      prizePool: h.prizePool || "TBA",
      tags: [displayStatus], // Now the tags will also show 'closed'
    };
  };
  /* ── Load User Context and Hackathons ── */
  useEffect(() => {
    const loadDiscoveryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch User Data to check which hackathons they are in
        let userData = null;
        try {
          const userRes = await API.get("/users/me", getAuthHeaders());
          userData = userRes.data?.data || userRes.data;
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

        // 3. For each hackathon, check if user is in a team (if logged in)
        if (userData) {
          const teamsPromises = raw.map(async (hackathon) => {
            try {
              const teamsRes = await API.get(`/hackathons/${hackathon._id}/teams`, getAuthHeaders());
              const allTeams = teamsRes.data?.data || [];
              
              // Find if user is in any team for this hackathon
              const userTeam = allTeams.find(team => 
                team.members?.some(m => 
                  String(m.userId?._id || m.userId) === String(userData._id)
                )
              );
              
              return userTeam ? { hackathonId: hackathon._id, team: userTeam } : null;
            } catch (err) {
              return null;
            }
          });

          const teamsResults = await Promise.all(teamsPromises);
          const userTeamsData = teamsResults.filter(Boolean);
          setUserTeams(userTeamsData);
        }

      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load hackathons.");
      } finally {
        setLoading(false);
      }
    };
    loadDiscoveryData();
  }, [query]);

  /* ── Memoized Filtering and Mapping ── */
  const filteredHackathons = useMemo(() => {
    // Map data only when both roles, teams, and hackathons are loaded
    const shaped = allHackathons.map(toCardShape);
    
    if (activeFilter === "All") return shaped;
    return shaped.filter((h) =>
      h.tags.some((tag) => tag.toLowerCase() === activeFilter.toLowerCase())
    );
  }, [activeFilter, allHackathons, userRoles, userTeams]);

  const visibleHackathons = filteredHackathons.slice(0, visibleCount);
  const hasMore = visibleCount < filteredHackathons.length;

  const handleFilterChange = (f) => {
    setActiveFilter(f);
    setVisibleCount(6); 
  };

  const handleSearchClick = () => {
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchClick();
  };

  return (
    <div className="discovery-container">
      <Navbar />

      <div className="discovery-header">
        <div className="discovery-header-content">
          <div className="discovery-search-wrapper">
             <Search size={20} color="#64748b" className="search-icon" />
             <input 
               type="text"
               value={searchInput}
               onChange={(e) => setSearchInput(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="Search hackathons, themes, or tech stacks..."
               className="discovery-search-input"
             />
             <button onClick={handleSearchClick} className="discovery-search-btn">Search</button>
          </div>
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      <main className="hackathon-grid" style={{ maxWidth: '1400px' }}>
        {loading && (
          <div className="empty-state-message">
            <p>Scanning for hackathons…</p>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state-message">
            <p>{error}</p>
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
            <p>No hackathons match "{query || activeFilter}".</p>
            <button className="btn-secondary" onClick={() => {
              setActiveFilter("All");
              setSearchInput("");
              setSearchParams({});
            }}>
              Clear Filters
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