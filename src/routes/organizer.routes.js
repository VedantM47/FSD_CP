import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.js';
import {
  applyForOrganizer,
  getApplications,
  reviewApplication,
  getOrganizerHackathons,
} from '../controllers/organizer.controller.js';

const router = express.Router();

// Apply to become an organizer (any authenticated user)
router.post('/apply', auth, applyForOrganizer);

// Admin routes for managing applications
router.get('/applications', auth, authorize('VIEW_ADMIN_DASHBOARD', (req) => ({ user: req.user })), getApplications);
router.patch('/applications/:id', auth, authorize('VIEW_ADMIN_DASHBOARD', (req) => ({ user: req.user })), reviewApplication);

// Organizer routes
router.get('/hackathons', auth, authorize('VIEW_ADMIN_DASHBOARD', (req) => ({ user: req.user })), getOrganizerHackathons);

export default router;
