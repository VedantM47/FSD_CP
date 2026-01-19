import React from 'react';

const CalendarListView = ({ events, onEventClick }) => {
    const getBadgeClass = (type) => {
        switch (type) {
            case 'Registration': return 'badge-registration';
            case 'Submission': return 'badge-submission';
            case 'Results': return 'badge-results';
            case 'Evaluation': return 'badge-evaluation';
            default: return '';
        }
    };

    return (
        <div className="calendar-list-view">
            <div className="list-view-header">
                <h2 className="list-view-title">Upcoming Events</h2>
            </div>

            <div className="table-wrapper">
                <table className="event-table">
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Hackathon</th>
                            <th>Event Type</th>
                            <th>Details</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length > 0 ? (
                            events.map((event) => (
                                <tr key={event.id} className="event-row" onClick={() => onEventClick(event)}>
                                    <td className="col-date">
                                        <div className="date-cell">
                                            <span className="date-icon">📅</span>
                                            <div>
                                                <div className="date-text">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                <div className="time-text">🕒 {event.time || 'All Day'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="col-hackathon">
                                        <div className="hackathon-name">{event.hackathon}</div>
                                        {event.round && <div className="hackathon-round">{event.round}</div>}
                                    </td>
                                    <td className="col-type">
                                        <span className={`type-badge ${getBadgeClass(event.type)}`}>
                                            {event.type}
                                        </span>
                                    </td>
                                    <td className="col-details">
                                        <div className="event-details-text">{event.name}</div>
                                    </td>
                                    <td className="col-action">
                                        <button
                                            className="btn-go-to-event"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Navigation logic
                                            }}
                                        >
                                            Go to Event →
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-events-cell">
                                    No events found matching your active filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CalendarListView;
