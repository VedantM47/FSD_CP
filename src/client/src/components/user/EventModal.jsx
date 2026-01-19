import React, { useEffect, useState } from 'react';

const EventModal = ({ event, isOpen, onClose }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!event || !isOpen) return;

        const calculateTimeRemaining = () => {
            const eventDate = new Date(`${event.date} ${event.time || '00:00'}`);
            const now = new Date();
            const difference = eventDate - now;

            if (difference <= 0) {
                return 'Event has passed';
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);

            let timeString = '';
            if (days > 0) timeString += `${days}d `;
            if (hours > 0) timeString += `${hours}h `;
            timeString += `${minutes}m remaining`;

            return timeString;
        };

        setTimeLeft(calculateTimeRemaining());
        const timer = setInterval(() => setTimeLeft(calculateTimeRemaining()), 60000);

        return () => clearInterval(timer);
    }, [event, isOpen]);

    if (!isOpen || !event) return null;

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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <div className="modal-header">
                    <span className={`event-badge ${getBadgeClass(event.type)}`}>
                        {event.type}
                    </span>
                    <span className="time-remaining">{timeLeft}</span>
                </div>

                <div className="modal-body">
                    <h2 className="modal-title">{event.name}</h2>
                    <h3 className="modal-hackathon">{event.hackathon}</h3>

                    <div className="modal-info-row">
                        <span className="info-label">Date:</span>
                        <span className="info-value">{new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</span>
                    </div>

                    <div className="modal-info-row">
                        <span className="info-label">Time:</span>
                        <span className="info-value">{event.time || 'ALL DAY'}</span>
                    </div>

                    <div className="modal-description">
                        {event.description || 'No additional details available for this event.'}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>View Hackathon</button>
                    <button className="btn-primary" onClick={onClose}>Go to Submission</button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
