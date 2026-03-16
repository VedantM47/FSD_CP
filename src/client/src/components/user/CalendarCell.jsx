import React from 'react';

const CalendarCell = ({ day, events, isToday, onEventClick }) => {
    if (!day) return <div className="day-cell muted"></div>;

    const getBadgeClass = (type) => {
        switch (type) {
            // New real-time types
            case 'hackathon_start': return 'badge-hackathon-start';
            case 'hackathon_end': return 'badge-hackathon-end';
            case 'deadline': return 'badge-submission';   // reuse red
            case 'presentation': return 'badge-evaluation';   // reuse purple
            case 'result': return 'badge-results';      // reuse green
            // Legacy static types (kept for backwards compat)
            case 'Registration': return 'badge-registration';
            case 'Submission': return 'badge-submission';
            case 'Results': return 'badge-results';
            case 'Evaluation': return 'badge-evaluation';
            default: return '';
        }
    };

    return (
        <div className={`day-cell ${isToday ? 'today' : ''}`}>
            <div className="date-number">{day}</div>
            <div className="events-stack">
                {events.map(event => {
                    // Show  "HackathonName — Event Type" e.g. "Yashwala — Hackathon Start"
                    const label = event.hackathon
                        ? `${event.hackathon} — ${event.name}`
                        : event.name;
                    return (
                        <div
                            key={event.id}
                            className={`event-badge ${getBadgeClass(event.type)}`}
                            title={label}
                            onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        >
                            {label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarCell;
