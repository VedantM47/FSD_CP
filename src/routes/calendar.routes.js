import express from 'express';
import { getPublicCalendar, exportToGoogleCalendar } from '../controllers/calendar.controller.js';

const router = express.Router();

// Public routes - no auth required
router.get('/', getPublicCalendar);
router.get('/export', exportToGoogleCalendar);

export default router;
