import React from 'react';

const CalendarSidebar = ({ filters, onFilterChange, typeLabels = {} }) => {
    const statusOptions = [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'past', label: 'Past' },
    ];

    // Build type options from the parent's TYPE_LABELS map
    const typeOptions = Object.entries(typeLabels).map(([value, label]) => ({ value, label }));

    return (
        <aside className="calendar-sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">Filters</h2>
                <div className="filter-actions">
                    <button className="text-btn" onClick={() => onFilterChange('reset')}>Reset</button>
                    <button className="text-btn" onClick={() => onFilterChange('clear')}>Clear</button>
                </div>
            </div>

            <div className="filter-group">
                <span className="filter-label">Status</span>
                {statusOptions.map(({ value, label }) => (
                    <label key={value} className="checkbox-item">
                        <input
                            type="checkbox"
                            checked={filters.status.includes(value)}
                            onChange={() => onFilterChange('status', value)}
                        /> {label}
                    </label>
                ))}
            </div>

            <div className="filter-group">
                <span className="filter-label">Event Type</span>
                {typeOptions.map(({ value, label }) => (
                    <label key={value} className="checkbox-item">
                        <input
                            type="checkbox"
                            checked={filters.type.includes(value)}
                            onChange={() => onFilterChange('type', value)}
                        /> {label}
                    </label>
                ))}
            </div>
        </aside>
    );
};

export default CalendarSidebar;
