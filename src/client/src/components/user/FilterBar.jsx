import React from "react";

const FilterBar = ({ activeFilter, onFilterChange }) => {
  // Match backend status enum: open | ongoing | closed | draft
  // Labels are user-friendly, values match what toCardShape puts in tags[]
  const filters = [
    { label: "All", value: "All" },
    { label: "Open", value: "open" },
    { label: "Live", value: "ongoing" },
    { label: "Closed", value: "closed" },
    { label: "Draft", value: "draft" },
  ];

  return (
    <div className="filter-bar">
      <div className="filter-container">
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`filter-tab ${activeFilter === filter.value ? "active" : ""}`}
            onClick={() => onFilterChange(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
