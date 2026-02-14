import React, { useState } from 'react';

const FilterBar = ({ activeFilter, onFilterChange }) => {
    const filters = ['All', 'Web3', 'AI', 'Machine Learning', 'FinTech', 'Social Impact'];

    return (
        <div className="filter-bar">
            <div className="filter-container">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                        onClick={() => onFilterChange(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterBar;
