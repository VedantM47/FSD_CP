import Hackathon from '../models/hackathon.model.js';
import { differenceInHours } from 'date-fns';

/**
 * @desc    Get public calendar events for all hackathons
 * @route   GET /api/calendar
 * @access  Public
 */
export const getPublicCalendar = async (req, res, next) => {
    try {
        // 1. Get all open or ongoing hackathons
        const hackathons = await Hackathon.find({ 
            status: { $in: ['open', 'ongoing', 'closed'] } 
        }).sort({ startDate: 1 });

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

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
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

    return res.status(200).send(icsContent);

  } catch (err) {
    next({ statusCode: 500, message: err.message });
  }
};

