import express from 'express';
import { getAllEvents, createEvent } from '../controllers/calendar.controller.js';

const router = express.Router();

router.get('/', getAllEvents);
router.post('/', createEvent);

export default router;
// import { getPublicCalendar, exportToGoogleCalendar } from '../controllers/calendar.controller.js';

// const router = express.Router();

// // Public routes - no auth required
// router.get('/', getPublicCalendar);
// router.get('/export', exportToGoogleCalendar);

// export default router;
