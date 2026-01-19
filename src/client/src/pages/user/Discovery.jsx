import React from 'react';
import Navbar from '../../components/common/Navbar';
import Hero from '../../components/user/Hero';
import FilterBar from '../../components/user/FilterBar';
import HackathonCard from '../../components/user/cards/HackathonCard';
import Footer from '../../components/common/Footer';
import { discoveryHackathons } from '../../data/discoveryData';
import '../../styles/discovery.css';

const Discovery = () => {
    const [activeFilter, setActiveFilter] = React.useState('All');

    const filteredHackathons = React.useMemo(() => {
        if (activeFilter === 'All') return discoveryHackathons;
        return discoveryHackathons.filter(h =>
            h.tags.some(tag => tag.toLowerCase().includes(activeFilter.toLowerCase()))
        );
    }, [activeFilter]);

    return (
        <div className="discovery-container">
            <Navbar />
            <FilterBar
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            <Hero />

            <main className="hackathon-grid">
                {filteredHackathons.map((hackathon) => (
                    <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}

                {filteredHackathons.length === 0 && (
                    <div className="empty-state-message">
                        <p>No hackathons found matching "{activeFilter}".</p>
                        <button className="btn-secondary" onClick={() => setActiveFilter('All')}>
                            Clear Filter
                        </button>
                    </div>
                )}
            </main>

            <div className="load-more-container">
                <button className="load-more-btn">Load More Hackathons</button>
            </div>

            <Footer />
        </div>
    );
};

export default Discovery;
