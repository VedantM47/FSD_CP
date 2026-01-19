import React, { useState, useMemo } from 'react';
import Navbar from '../../components/common/Navbar';
import CalendarSidebar from '../../components/user/CalendarSidebar';
import CalendarGrid from '../../components/user/CalendarGrid';
import CalendarListView from '../../components/user/CalendarListView';
import Footer from '../../components/common/Footer';
import { calendarEvents } from '../../data/calendarData';
import EventModal from '../../components/user/EventModal';
import '../../styles/calendar.css';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
    const [filters, setFilters] = useState({
        status: ['Ongoing', 'Upcoming', 'Past'],
        type: ['Registration', 'Submission', 'Results', 'Evaluation']
    });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'list'
    const [categoryMode, setCategoryMode] = useState('personalized'); // 'personalized', 'generic'

    const handleFilterChange = (category, value) => {
        setFilters(prev => {
            if (category === 'reset') {
                return {
                    status: ['Ongoing', 'Upcoming', 'Past'],
                    type: ['Registration', 'Submission', 'Results', 'Evaluation']
                };
            }
            if (category === 'clear') {
                return { status: [], type: [] };
            }

            const current = prev[category];
            const next = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: next };
        });
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
    };

    const filteredEvents = useMemo(() => {
        return calendarEvents.filter(event => {
            const statusMatch = filters.status.length === 0 ||
                filters.status.some(s => s.toLowerCase() === event.status.toLowerCase().trim());

            const typeMatch = filters.type.length === 0 ||
                filters.type.some(t => t.toLowerCase() === event.type.toLowerCase().trim());

            return statusMatch && typeMatch;
        });
    }, [filters]);

    const onNavigateMonth = (direction) => {
        const nextDate = new Date(currentDate);
        nextDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(nextDate);
    };

    return (
        <div className="calendar-page">
            <Navbar />

            <div className="calendar-top-bar">
                <div className="category-toggles">
                    <button
                        className={`cat-btn ${categoryMode === 'personalized' ? 'active' : ''}`}
                        onClick={() => setCategoryMode('personalized')}
                    >
                        Personalized
                    </button>
                    <button
                        className={`cat-btn ${categoryMode === 'generic' ? 'active' : ''}`}
                        onClick={() => setCategoryMode('generic')}
                    >
                        Generic
                    </button>
                </div>

                <div className="view-mode-toggles">
                    <span>View:</span>
                    <button
                        className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
                        onClick={() => setViewMode('month')}
                    >
                        📅 Month
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
                        onClick={() => setViewMode('week')}
                    >
                        🗓️ Week
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        📋 List
                    </button>
                </div>
            </div>

            <main className="calendar-container">
                <CalendarSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                <section className="calendar-main-content">
                    {viewMode === 'month' ? (
                        <CalendarGrid
                            currentDate={currentDate}
                            events={filteredEvents}
                            onNavigate={onNavigateMonth}
                            onEventClick={handleEventClick}
                        />
                    ) : (
                        <CalendarListView
                            events={filteredEvents}
                            onEventClick={handleEventClick}
                        />
                    )}
                </section>
            </main>

            <EventModal
                event={selectedEvent}
                isOpen={isModalOpen}
                onClose={closeModal}
            />

            <Footer />
        </div>
    );
};

export default Calendar;
