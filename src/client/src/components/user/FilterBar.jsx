import React from "react";
import { Filter } from 'lucide-react';

const FilterBar = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { label: "All Hackathons", value: "All" },
    { label: "Open for Registration", value: "open" },
    { label: "Live Now", value: "ongoing" },
    { label: "Closed Events", value: "closed" },
    { label: "Drafts", value: "draft" },
  ];

  return (
    <div className="filter-dropdown-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', width: 'fit-content' }}>
      <Filter size={16} color="#64748b" />
      <select
        value={activeFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: '0.95rem',
          fontWeight: '500',
          color: '#334155',
          cursor: 'pointer',
          paddingRight: '8px'
        }}
      >
        {filters.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;
