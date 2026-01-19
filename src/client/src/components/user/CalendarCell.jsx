import React from 'react';

const CalendarCell = ({ day, events, isToday, onEventClick }) => {
    if (!day) return <div className="day-cell muted"></div>;

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
        <div className={`day-cell ${isToday ? 'today' : ''}`}>
            <div className="date-number">{day}</div>
            <div className="events-stack">
                {events.map(event => (
                    <div
                        key={event.id}
                        className={`event-badge ${getBadgeClass(event.type)}`}
                        title={`${event.hackathon}: ${event.name}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                        }}
                    >
                        {event.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarCell;
