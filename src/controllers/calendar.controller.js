import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';
import { differenceInHours } from 'date-fns';

/**
 * @desc    Get personalized calendar events for the user
 * @route   GET /api/calendar
 * @access  Private
 */
export const getUserCalendar = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // 1. Get Hackathons where user has a role (participant, judge, organizer)
        const registeredHackathonIds = req.user.hackathonRoles.map(hr => hr.hackathonId);
        const hackathons = await Hackathon.find({ _id: { $in: registeredHackathonIds } });

        // 2. Get Teams the user belongs to
        const teams = await Team.find({ 'members.userId': userId })
            .populate('hackathonId', 'title')
            .lean();

        const events = [];
        const now = new Date();

        hackathons.forEach(h => {
            const userRole = req.user.hackathonRoles.find(hr => hr.hackathonId.toString() === h._id.toString())?.role;

            // Add common hackathon dates
            const baseEvents = [
                { title: `${h.title} - Start`, start: h.startDate, type: 'hackathon_start', color: '#1d4ed8' }, // Blue
                { title: `${h.title} - End`, start: h.endDate, type: 'hackathon_end', color: '#1e3a8a' },
                { title: `${h.title} - Registration Deadline`, start: h.registrationDeadline, type: 'deadline', color: '#dc2626' }, // Red
                { title: `${h.title} - Result Announcement`, start: h.resultDate, type: 'result', color: '#059669' }, // Green
            ];

            // Participant specific deadlines
            if (userRole === 'participant') {
                baseEvents.push(
                    { title: `${h.title} - Prototype Submission`, start: h.prototypeDeadline, type: 'deadline', color: '#ef4444' },
                    { title: `${h.title} - Final Submission`, start: h.finalDeadline, type: 'deadline', color: '#b91c1c' }
                );
            }

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

        // 3. Add Team-specific presentation slots
        teams.forEach(t => {
            if (t.presentationSlot && t.presentationSlot.date) {
                events.push({
                    id: `${t._id}-presentation`,
                    hackathonId: t.hackathonId._id,
                    hackathonName: t.hackathonId.title,
                    teamName: t.name,
                    title: `Presentation Slot: ${t.name}`,
                    start: t.presentationSlot.date,
                    type: 'presentation',
                    color: '#7c3aed', // Purple
                    details: {
                        startTime: t.presentationSlot.startTime,
                        endTime: t.presentationSlot.endTime
                    }
                });
            }
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
 * @access  Private
 */

export const exportToGoogleCalendar = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch calendar events (reuse your existing logic)
    const events = await CalendarEvent.find({ userId });

    if (!events.length) {
      return res.status(404).json({
        success: false,
        message: 'No calendar events found to export'
      });
    }

    // 2. Build ICS content
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
PRODID:-//YourApp//Calendar Export//EN
`;

    events.forEach(event => {
      const formatDate = (date) =>
        new Date(date)
          .toISOString()
          .replace(/[-:]/g, '')
          .split('.')[0] + 'Z';

      icsContent += `BEGIN:VEVENT
UID:${event._id}@yourapp.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
END:VEVENT
`;
    });

    icsContent += `END:VCALENDAR`;

    // 3. Send as downloadable file
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="calendar.ics"'
    );

    return res.status(200).send(icsContent);

  } catch (err) {
    next({ statusCode: 500, message: err.message });
  }
};

