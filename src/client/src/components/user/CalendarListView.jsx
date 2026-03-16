import React, { useState, useMemo } from 'react';

// ── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
};

const TYPE_ICON = {
    hackathon_start: '🟢',
    hackathon_end: '🔵',
    deadline: '🔴',
    presentation: '🟣',
    result: '🏆',
};

const TYPE_LABEL = {
    hackathon_start: 'Hackathon Start',
    hackathon_end: 'Hackathon End',
    deadline: 'Deadline',
    presentation: 'Presentation Day',
    result: 'Results Announced',
};

// Badge colour class for timeline row
const rowClass = (type) => {
    switch (type) {
        case 'hackathon_start': return 'tl-start';
        case 'hackathon_end': return 'tl-end';
        case 'deadline': return 'tl-deadline';
        case 'presentation': return 'tl-presentation';
        case 'result': return 'tl-result';
        default: return '';
    }
};

// ── Component ──────────────────────────────────────────────────────────────
const CalendarListView = ({ events, onEventClick }) => {
    const [expandedHackathon, setExpandedHackathon] = useState(null);

    // Group events by hackathon name
    const hackathons = useMemo(() => {
        const map = {};
        events.forEach(e => {
            const key = e.hackathonName || e.hackathon || 'Unknown Hackathon';
            if (!map[key]) map[key] = { name: key, events: [] };
            map[key].events.push(e);
        });
        // Sort each hackathon's events chronologically
        Object.values(map).forEach(h => {
            h.events.sort((a, b) => new Date(a.start) - new Date(b.start));
        });
        // Sort hackathons by their earliest date
        return Object.values(map).sort((a, b) => {
            const aDate = new Date(a.events[0]?.start || 0);
            const bDate = new Date(b.events[0]?.start || 0);
            return aDate - bDate;
        });
    }, [events]);

    if (!events.length) {
        return (
            <div className="calendar-list-view">
                <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No hackathon events found matching your filters.
                </p>
            </div>
        );
    }

    return (
        <div className="calendar-list-view">
            <div className="list-view-header">
                <h2 className="list-view-title">Hackathons ({hackathons.length})</h2>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
                    Click on a hackathon to see its full timeline
                </p>
            </div>

            <div className="hackathon-list">
                {hackathons.map(h => {
                    const isOpen = expandedHackathon === h.name;
                    const start = h.events.find(e => e.type === 'hackathon_start')?.start;
                    const end = h.events.find(e => e.type === 'hackathon_end')?.start;

                    return (
                        <div key={h.name} className="hackathon-card">
                            {/* ── Hackathon header row ── */}
                            <button
                                className={`hackathon-card-header ${isOpen ? 'expanded' : ''}`}
                                onClick={() => setExpandedHackathon(isOpen ? null : h.name)}
                            >
                                <div className="hackathon-card-info">
                                    <span className="hackathon-card-name">🏆 {h.name}</span>
                                    <span className="hackathon-card-dates">
                                        {start ? formatDate(start) : '?'} → {end ? formatDate(end) : '?'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="hackathon-event-count">{h.events.length} events</span>
                                    <span className="expand-icon">{isOpen ? '▲' : '▼'}</span>
                                </div>
                            </button>

                            {/* ── Timeline (shown when expanded) ── */}
                            {isOpen && (
                                <div className="hackathon-timeline">
                                    {h.events.map((event, idx) => (
                                        <div
                                            key={event.id || idx}
                                            className={`timeline-row ${rowClass(event.type)}`}
                                            onClick={() => onEventClick(event)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="tl-icon">
                                                {TYPE_ICON[event.type] || '📅'}
                                            </div>
                                            <div className="tl-body">
                                                <div className="tl-label">
                                                    {TYPE_LABEL[event.type] || event.name}
                                                </div>
                                                <div className="tl-date">
                                                    {formatDate(event.start)}
                                                </div>
                                            </div>
                                            <div className={`tl-status ${event.status === 'past' ? 'past' : 'upcoming'}`}>
                                                {event.status === 'past' ? 'Past' : 'Upcoming'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarListView;
