import CalendarEvent from '../models/calendar.model.js';
import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';
import { differenceInHours } from 'date-fns';
import log from '../utils/logger.js';

export const getAllEvents = async (req, res, next) => {
    try {
        log.info('GET_EVENTS', 'Fetching all calendar events');
        const events = await CalendarEvent.find().populate('hackathon').sort({ date: 1 });
        log.success('GET_EVENTS', `Returning ${events.length} events`);
        res.status(200).json({
            success: true,
            data: events,
        });
    } catch (error) {
        next(error);
    }
};

export const createEvent = async (req, res, next) => {
    try {
        log.info('CREATE_EVENT', 'Creating calendar event', { title: req.body.title, type: req.body.type });
        const event = await CalendarEvent.create(req.body);
        log.success('CREATE_EVENT', `Event created: "${event.title}"`);
        res.status(201).json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get public calendar events for all hackathons
 * @route   GET /api/calendar
 * @access  Public
 */
export const getPublicCalendar = async (req, res, next) => {
    try {
        log.info('PUBLIC_CALENDAR', 'Fetching public calendar events');
        // 1. Get ALL hackathons (including draft) so newly-created ones appear immediately
        const hackathons = await Hackathon.find().sort({ startDate: 1 });

        const events = [];
        const now = new Date();

        hackathons.forEach(h => {
            // Add common hackathon dates
            const baseEvents = [
                { title: `${h.title} - Start`, start: h.startDate, type: 'hackathon_start', color: '#1d4ed8' }, // Blue
                { title: `${h.title} - End`, start: h.endDate, type: 'hackathon_end', color: '#1e3a8a' },
                { title: `${h.title} - Registration Deadline`, start: h.registrationDeadline, type: 'deadline', color: '#dc2626' }, // Red
                { title: `${h.title} - Prototype Submission`, start: h.prototypeDeadline, type: 'deadline', color: '#ef4444' },
                { title: `${h.title} - Final Submission`, start: h.finalDeadline, type: 'deadline', color: '#b91c1c' },
                { title: `${h.title} - Result Announcement`, start: h.resultDate, type: 'result', color: '#059669' }, // Green
            ];

            baseEvents.forEach(evt => {
                if (evt.start) {
                    // Smart Layer: Detect high-risk deadlines (< 24h)
                    const risk = evt.type === 'deadline' && differenceInHours(evt.start, now) < 24 && differenceInHours(evt.start, now) > 0;

                    events.push({
                        id: `${h._id}-${evt.type}`,
                        hackathonId: h._id,
                        hackathonName: h.title,
                        ...evt,
                        isHighRisk: risk,
                        status: evt.start < now ? 'past' : 'upcoming'
                    });
                }
            });
        });

        log.success('PUBLIC_CALENDAR', `Returning ${events.length} events`);
        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        log.error('PUBLIC_CALENDAR', 'Failed to fetch public calendar', err);
        next({ statusCode: 500, message: err.message });
    }
};

/**
 * @desc    Get calendar events for hackathons the logged-in user is registered in
 * @route   GET /api/calendar/my-events
 * @access  Private (requires auth)
 */
export const getMyCalendarEvents = async (req, res, next) => {
    try {
        const userId = req.user._id;
        log.info('MY_CALENDAR', `Fetching personalised calendar for user: ${req.user.email}`);

        // 1. Find all teams the user is in (as leader or accepted/pending member)
        const teams = await Team.find({
            $or: [
                { leader: userId },
                { 'members.userId': userId }
            ]
        }).select('hackathonId');

        if (!teams.length) {
            log.info('MY_CALENDAR', 'User has no teams — returning empty calendar');
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        // 2. Collect unique hackathon IDs
        const hackathonIds = [...new Set(teams.map(t => t.hackathonId.toString()))];

        // 3. Fetch those hackathons
        const hackathons = await Hackathon.find({ _id: { $in: hackathonIds } });

        const events = [];
        const now = new Date();

        // 4. Map each hackathon's date fields to event objects
        hackathons.forEach(h => {
            const dateFields = [
                {
                    field: h.startDate,
                    type: 'hackathon_start',
                    label: 'Hackathon Start',
                    color: '#1d4ed8'
                },
                {
                    field: h.endDate,
                    type: 'hackathon_end',
                    label: 'Hackathon End',
                    color: '#1e3a8a'
                },
                {
                    field: h.registrationDeadline,
                    type: 'deadline',
                    label: 'Registration Deadline',
                    color: '#dc2626'
                },
                {
                    field: h.prototypeDeadline,
                    type: 'deadline',
                    label: 'Prototype Submission',
                    color: '#ef4444'
                },
                {
                    field: h.finalDeadline,
                    type: 'deadline',
                    label: 'Final Submission',
                    color: '#b91c1c'
                },
                {
                    field: h.presentationDate,
                    type: 'presentation',
                    label: 'Presentation Day',
                    color: '#7c3aed'
                },
                {
                    field: h.resultDate,
                    type: 'result',
                    label: 'Results Announced',
                    color: '#059669'
                },
            ];

            dateFields.forEach(evt => {
                if (!evt.field) return; // skip if date not set

                const isHighRisk =
                    evt.type === 'deadline' &&
                    differenceInHours(new Date(evt.field), now) < 24 &&
                    differenceInHours(new Date(evt.field), now) > 0;

                events.push({
                    id: `${h._id}-${evt.type}-${evt.label.replace(/\s+/g, '-')}`,
                    hackathonId: h._id,
                    hackathonName: h.title,
                    title: `${h.title} — ${evt.label}`,
                    start: evt.field,                           // ISO date — used by CalendarGrid
                    type: evt.type,
                    color: evt.color,
                    status: new Date(evt.field) < now ? 'past' : 'upcoming',
                    isHighRisk,
                });
            });
        });

        // Sort chronologically
        events.sort((a, b) => new Date(a.start) - new Date(b.start));

        log.success('MY_CALENDAR', `Returning ${events.length} events for ${hackathons.length} hackathon(s)`);
        res.status(200).json({
            success: true,
            count: events.length,
            data: events,
        });
    } catch (err) {
        log.error('MY_CALENDAR', 'Failed to fetch personalised calendar', err);
        next({ statusCode: 500, message: err.message });
    }
};

/**
 * @desc    Export calendar as ICS file
 * @route   GET /api/calendar/export
 * @access  Public
 */
export const exportToGoogleCalendar = async (req, res, next) => {
    try {
        log.info('EXPORT_CALENDAR', 'Exporting calendar as ICS');
        // 1. Fetch all hackathons
        const hackathons = await Hackathon.find({
            status: { $in: ['open', 'ongoing'] }
        });

        if (!hackathons.length) {
            return res.status(404).json({
                success: false,
                message: 'No hackathons found to export'
            });
        }

        // 2. Build ICS content
        let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
PRODID:-//HackathonPlatform//Calendar Export//EN
`;

        hackathons.forEach(h => {
            const formatDate = (date) => {
                if (!date) return null;
                return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };

            const addEvent = (title, start, end, description) => {
                const dtStart = formatDate(start);
                const dtEnd = formatDate(end || start); // Default to start time if no end time

                if (!dtStart) return;

                icsContent += `BEGIN:VEVENT
UID:${h._id}-${title.replace(/\s+/g, '-')}@hackathonplatform.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${h.title} - ${title}
DESCRIPTION:${description || ''}
END:VEVENT
`;
            };

            addEvent('Start', h.startDate, h.endDate, h.description);
            addEvent('Registration Deadline', h.registrationDeadline, null, 'Registration closes');
            addEvent('Prototype Submission', h.prototypeDeadline, null, 'Prototype submission deadline');
            addEvent('Final Submission', h.finalDeadline, null, 'Final project submission deadline');
        });

        icsContent += `END:VCALENDAR`;

        // 3. Send as downloadable file
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="hackathon-calendar.ics"'
        );

        log.success('EXPORT_CALENDAR', `ICS file generated with ${hackathons.length} hackathons`);
        return res.status(200).send(icsContent);

    } catch (err) {
        log.error('EXPORT_CALENDAR', 'Failed to export calendar', err);
        next({ statusCode: 500, message: err.message });
    }
};
