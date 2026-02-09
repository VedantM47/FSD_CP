import CalendarEvent from '../models/calendar.model.js';

export const getAllEvents = async (req, res, next) => {
    try {
        const events = await CalendarEvent.find().populate('hackathon').sort({ date: 1 });
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
        const event = await CalendarEvent.create(req.body);
        res.status(201).json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(error);
    }
};