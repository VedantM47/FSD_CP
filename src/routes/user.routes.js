import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import adminOnly from '../middlewares/admin.middleware.js';

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

// Public
router.post('/register', register);
router.post('/login', login);

// User (self)
router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);

// Admin
router.get('/', auth, adminOnly, getAllUsers);
router.get('/:id', auth, adminOnly, getUserById);
router.delete('/:id', auth, adminOnly, deleteUser);

export default router;