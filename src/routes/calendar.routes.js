import express from 'express';
import { getUserCalendar, exportToGoogleCalendar } from '../controllers/calendar.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', auth, getUserCalendar);
router.get('/export', auth, exportToGoogleCalendar);

export default router;
