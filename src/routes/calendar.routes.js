import express from 'express';
import {
    getAllEvents,
    createEvent,
    getMyCalendarEvents,
    getPublicCalendar,
    exportToGoogleCalendar,
} from '../controllers/calendar.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes — no auth required
router.get('/', getPublicCalendar);
router.get('/export', exportToGoogleCalendar);

// Personalised calendar — events derived from the user's registered hackathons (auth required)
router.get('/my-events', auth, getMyCalendarEvents);

// Admin-only: raw event CRUD
router.get('/all', auth, getAllEvents);
router.post('/', auth, createEvent);

export default router;
