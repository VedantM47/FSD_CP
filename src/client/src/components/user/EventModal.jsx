import React, { useEffect, useState } from 'react';

const TYPE_ICON = {
    hackathon_start: '🟢',
    hackathon_end: '🔵',
    deadline: '🔴',
    presentation: '🟣',
    result: '🏆',
};

const TYPE_BADGE_CLASS = {
    hackathon_start: 'badge-hackathon-start',
    hackathon_end: 'badge-hackathon-end',
    deadline: 'badge-submission',
    presentation: 'badge-evaluation',
    result: 'badge-results',
    // legacy
    Registration: 'badge-registration',
    Submission: 'badge-submission',
    Results: 'badge-results',
    Evaluation: 'badge-evaluation',
};

const TYPE_LABEL = {
    hackathon_start: 'Hackathon Start',
    hackathon_end: 'Hackathon End',
    deadline: 'Deadline',
    presentation: 'Presentation Day',
    result: 'Results Announced',
};

const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
};

const EventModal = ({ event, isOpen, onClose }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!event || !isOpen) return;

        const calculateTimeRemaining = () => {
            // Use event.start (ISO string from API), not event.date (old static field)
            const eventDate = new Date(event.start || event.date);
            const now = new Date();
            const difference = eventDate - now;

            if (isNaN(difference) || difference <= 0) return 'Event has passed';

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);

            let s = '';
            if (days > 0) s += `${days}d `;
            if (hours > 0) s += `${hours}h `;
            s += `${minutes}m remaining`;
            return s;
        };

        setTimeLeft(calculateTimeRemaining());
        const timer = setInterval(() => setTimeLeft(calculateTimeRemaining()), 60000);
        return () => clearInterval(timer);
    }, [event, isOpen]);

    if (!isOpen || !event) return null;

    const badgeClass = TYPE_BADGE_CLASS[event.type] || '';
    const typeLabel = TYPE_LABEL[event.type] || event.type;
    const icon = TYPE_ICON[event.type] || '📅';
    const hackathonName = event.hackathon || event.hackathonName || '';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <div className="modal-header">
                    <span className={`event-badge ${badgeClass}`}>
                        {icon} {typeLabel}
                    </span>
                    {timeLeft && (
                        <span className="time-remaining">{timeLeft}</span>
                    )}
                </div>

                <div className="modal-body">
                    {/* Hackathon name as main title */}
                    <h2 className="modal-title">{hackathonName}</h2>
                    {/* Event type as subtitle */}
                    <h3 className="modal-hackathon">{typeLabel}</h3>

                    <div className="modal-info-row">
                        <span className="info-label">Date:</span>
                        <span className="info-value">
                            {formatDate(event.start || event.date)}
                        </span>
                    </div>

                    {event.time && (
                        <div className="modal-info-row">
                            <span className="info-label">Time:</span>
                            <span className="info-value">{event.time}</span>
                        </div>
                    )}

                    {event.isHighRisk && (
                        <div style={{
                            background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: '8px', padding: '10px 14px',
                            color: '#dc2626', fontWeight: 600, fontSize: '0.85rem',
                            marginTop: '12px'
                        }}>
                            Deadline in less than 24 hours!
                        </div>
                    )}

                    <div className="modal-description">
                        {event.description || 'No additional details available for this event.'}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
