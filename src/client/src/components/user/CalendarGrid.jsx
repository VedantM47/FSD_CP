import React from 'react';
import CalendarCell from './CalendarCell';

const CalendarGrid = ({ currentDate, events, onNavigate, onEventClick }) => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({ day: null });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        // Match events whose `start` date (ISO string from MongoDB) falls on this day
        const dayEvents = events.filter(e => {
            if (!e.start) return false;
            const d = new Date(e.start);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === i;
        });
        days.push({ day: i, events: dayEvents });
    }

    const today = new Date();
    const isToday = (d) =>
        today.getDate() === d &&
        today.getMonth() === month &&
        today.getFullYear() === year;

    return (
        <section className="calendar-section">
            <div className="calendar-header">
                <div className="month-nav">
                    <span className="current-month">{monthName} {year}</span>
                    <div className="nav-controls">
                        <button className="nav-btn" onClick={() => onNavigate(-1)} aria-label="Previous month">{'<'}</button>
                        <button className="nav-btn" onClick={() => onNavigate(1)} aria-label="Next month">{'>'}</button>
                    </div>
                </div>
            </div>

            <div className="calendar-grid">
                {weekDays.map(day => (
                    <div key={day} className="weekday-header">{day}</div>
                ))}

                {days.map((dayObj, index) => (
                    <CalendarCell
                        key={index}
                        day={dayObj.day}
                        events={dayObj.events || []}
                        isToday={isToday(dayObj.day)}
                        onEventClick={onEventClick}
                    />
                ))}

                {events.length === 0 && (
                    <div className="empty-state-message">
                        <p>No events found matching your active filters.</p>
                        <button className="btn-secondary" onClick={() => onNavigate(0)}>Clear Filters</button>
                    </div>
                )}
            </div>

            <div className="calendar-legend">
                <span className="legend-title">Legend:</span>
                <div className="legend-item">
                    <div className="legend-dot badge-hackathon-start"></div> Hackathon Start
                </div>
                <div className="legend-item">
                    <div className="legend-dot badge-hackathon-end"></div> Hackathon End
                </div>
                <div className="legend-item">
                    <div className="legend-dot badge-submission"></div> Deadline
                </div>
                <div className="legend-item">
                    <div className="legend-dot badge-evaluation"></div> Presentation
                </div>
                <div className="legend-item">
                    <div className="legend-dot badge-results"></div> Results
                </div>
            </div>
        </section>
    );
};

export default CalendarGrid;
