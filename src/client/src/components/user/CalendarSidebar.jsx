import React from 'react';

const CalendarSidebar = ({ filters, onFilterChange }) => {
    const statusOptions = ['Ongoing', 'Upcoming', 'Past'];
    const typeOptions = ['Registration', 'Submission', 'Results', 'Evaluation'];

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
                <label className="filter-label" htmlFor="hackathon-select">Select Hackathons</label>
                <select id="hackathon-select" className="select-hackathon">
                    <option value="all">All Hackathons</option>
                    <option value="ai">AI Innovation Challenge</option>
                    <option value="web3">Web3 Builder</option>
                    <option value="iot">IoT Smart Cities</option>
                </select>
            </div>

            <div className="filter-group">
                <span className="filter-label">Status</span>
                {statusOptions.map(status => (
                    <label key={status} className="checkbox-item">
                        <input
                            type="checkbox"
                            checked={filters.status.includes(status)}
                            onChange={() => onFilterChange('status', status)}
                        /> {status}
                    </label>
                ))}
            </div>

            <div className="filter-group">
                <span className="filter-label">Event Type</span>
                {typeOptions.map(type => (
                    <label key={type} className="checkbox-item">
                        <input
                            type="checkbox"
                            checked={filters.type.includes(type)}
                            onChange={() => onFilterChange('type', type)}
                        /> {type}
                    </label>
                ))}
            </div>
        </aside>
    );
};

export default CalendarSidebar;
