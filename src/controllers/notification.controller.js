import Notification from '../models/notification.model.js';
import Hackathon from '../models/hackathon.model.js';
import User from '../models/user.model.js';
import { differenceInHours, subDays, subHours } from 'date-fns';

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (err) {
        next({ statusCode: 500, message: err.message });
    }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { readStatus: true },
            { new: true }
        );

        if (!notification) {
            return next({ statusCode: 404, message: 'Notification not found' });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (err) {
        next({ statusCode: 400, message: err.message });
    }
};

/**
 * @desc    Trigger reminder generation (Demo/Cron Simulation)
 *          Scans all hackathons and participants to create notifications.
 * @route   POST /api/notifications/trigger
 * @access  Admin
 */
export const triggerReminders = async (req, res, next) => {
    try {
        const now = new Date();
        const hackathons = await Hackathon.find({ status: { $in: ['open', 'ongoing'] } });

        let createdCount = 0;

        for (const h of hackathons) {
            // Find all participants
            const participants = await User.find({
                'hackathonRoles': {
                    $elemMatch: { hackathonId: h._id, role: 'participant' }
                }
            });

            const deadlines = [
                { type: 'Prototype Submission', date: h.prototypeDeadline, key: 'prototype' },
                { type: 'Final Submission', date: h.finalDeadline, key: 'final' },
                { type: 'Registration', date: h.registrationDeadline, key: 'registration' }
            ];

            for (const d of deadlines) {
                if (!d.date) continue;

                const hoursLeft = differenceInHours(d.date, now);

                // Define intervals for logic: 7 days (168h), 3 days (72h), 24 hours, 2 hours
                const intervals = [168, 72, 24, 2];

                for (const interval of intervals) {
                    // If we are within the interval window (e.g., between 24 and 25 hours left)
                    // we trigger a notification if one doesn't already exist for this user/deadline/interval
                    if (hoursLeft <= interval && hoursLeft > (interval - 1)) {
                        for (const p of participants) {
                            const message = `${d.type} for "${h.title}" ends in approx. ${interval} ${interval > 24 ? 'days' : 'hours'}.`;

                            // Check for existing notification to avoid spamming
                            const existing = await Notification.findOne({
                                userId: p._id,
                                hackathonId: h._id,
                                deadlineType: d.key,
                                message: { $regex: new RegExp(`in approx. ${interval}`) }
                            });

                            if (!existing) {
                                await Notification.create({
                                    userId: p._id,
                                    hackathonId: h._id,
                                    message,
                                    type: 'deadline',
                                    scheduledFor: now,
                                    deadlineType: d.key
                                });
                                createdCount++;
                            }
                        }
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            message: `Notifications scanned and generated. Created ${createdCount} new reminders.`,
        });
    } catch (err) {
        next({ statusCode: 500, message: err.message });
    }
};
