import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.js';

import {
  register,
  login,
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  deleteUser,
} from '../controllers/user.controller.js';

const router = express.Router();

/* ============ PUBLIC ============ */
router.post('/register', register);
router.post('/login', login);

/* ============ USER (SELF) ============ */
router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);

/* ============ ADMIN (ABAC) ============ */

// Get all users
router.get(
  '/',
  auth,
  authorize('VIEW_ALL_USERS', async (req) => ({
    user: req.user,
  })),
  getAllUsers
);

// Get user by ID
router.get(
  '/:id',
  auth,
  authorize('VIEW_USER_BY_ID', async (req) => ({
    user: req.user,
    targetUserId: req.params.id,
  })),
  getUserById
);

// Delete user
router.delete(
  '/:id',
  auth,
  authorize('DELETE_USER', async (req) => ({
    user: req.user,
    targetUserId: req.params.id,
  })),
  deleteUser
);

export default router;