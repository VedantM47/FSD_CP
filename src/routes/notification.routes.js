import express from 'express';
import { getNotifications, markAsRead, triggerReminders } from '../controllers/notification.controller.js';
import auth from '../middlewares/auth.middleware.js';
import adminOnly from '../middlewares/admin.middleware.js';

const router = express.Router();

router.get('/', auth, getNotifications);
router.patch('/:id/read', auth, markAsRead);

// In a real app, this would be a cron or background job
// Exposed as an admin endpoint for testing/manual triggers
router.post('/trigger', auth, adminOnly, triggerReminders);

export default router;
