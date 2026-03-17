import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt.js';
import log from '../utils/logger.js';


// ========================= Register User =========================
export const register = async (req, res, next) => {
  try {
    log.info('REGISTER', 'Attempting registration', { email: req.body.email, fullName: req.body.fullName });

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const newUser = await User.create({
      ...req.body,
      systemRole: 'user',
      password: hashedPassword,
    });

    log.success('REGISTER', `User created: ${newUser.email} (id=${newUser._id})`);

    res.status(201).json({
      success: true,
      token: signToken({ id: newUser._id }),
    });
  } catch (err) {
    log.error('REGISTER', 'Registration failed', err);
    next({ statusCode: 400, message: err.message });
  }
};
  

// ========================= Login User =========================
export const login = async (req, res, next) => {
  try {
    log.info('LOGIN', 'Login attempt', { email: req.body.email });

    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user) {
      log.warn('LOGIN', `User not found: ${req.body.email}`);
      return next({
        statusCode: 401,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      log.warn('LOGIN', `Wrong password for: ${user.email}`);
      return next({
        statusCode: 401,
        message: 'Invalid credentials',
      });
    }

    const token = signToken({ id: user._id });
    log.success('LOGIN', `Login successful: ${user.email} (role=${user.systemRole})`);

    res.status(200).json({
      success: true,
      token: token,
    });
  } catch (err) {
    log.error('LOGIN', 'Login failed', err);
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

/* ========================= Logout User ========================= */
export const logout = async (req, res) => {
  try {
    log.info('LOGOUT', `User logging out: ${req.user?.email}`);
    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  } catch (err) {
    log.error('LOGOUT', 'Logout failed', err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* ================= GET SELF ================= */
export const getMe = async (req, res) => {
  log.info('GET_ME', `Returning profile for: ${req.user?.email}`);
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

/* ================= UPDATE SELF ================= */
export const updateMe = async (req, res, next) => {
  try {
    log.info('UPDATE_ME', `User updating profile: ${req.user?.email}`, { fields: Object.keys(req.body) });
    delete req.body.systemRole;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    );

    log.success('UPDATE_ME', `Profile updated: ${updatedUser.email}`);
    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    log.error('UPDATE_ME', 'Profile update failed', err);
    next({ statusCode: 400, message: err.message });
  }
};

/* ================= SEARCH USERS ================= */
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    log.info('SEARCH_USERS', `Searching users`, { query: q, by: req.user?.email });

    if (!q) {
      return next({
        statusCode: 400,
        message: 'Search query is required',
      });
    }

    const users = await User.find(
      {
        $and: [
          { systemRole: 'user' },
          {
            $or: [
              { fullName: { $regex: q, $options: 'i' } },
              { email: { $regex: q, $options: 'i' } },
            ],
          }
        ]
      },
      'fullName email'
    ).limit(20);

    log.success('SEARCH_USERS', `Found ${users.length} users for query="${q}"`);
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    log.error('SEARCH_USERS', 'Search failed', err);
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};


/* ================= ADMIN: GET ALL USERS ================= */
export const getAllUsers = async (req, res, next) => {
  try {
    log.info('GET_ALL_USERS', `Admin fetching all users`, { by: req.user?.email });
    const users = await User.find().select('-password');

    log.success('GET_ALL_USERS', `Returning ${users.length} users`);
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    log.error('GET_ALL_USERS', 'Failed to fetch users', err);
    next({ statusCode: 500, message: err.message });
  }
};

/* ================= ADMIN: GET USER BY ID ================= */
export const getUserById = async (req, res, next) => {
  try {
    log.info('GET_USER_BY_ID', `Fetching user`, { targetId: req.params.id, by: req.user?.email });
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      log.warn('GET_USER_BY_ID', `User not found: ${req.params.id}`);
      return next({ statusCode: 404, message: 'User not found' });
    }

    log.success('GET_USER_BY_ID', `Found user: ${user.email}`);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    log.error('GET_USER_BY_ID', 'Failed to fetch user', err);
    next({ statusCode: 400, message: err.message });
  }
};

/* ================= ADMIN: DELETE USER ================= */
export const deleteUser = async (req, res, next) => {
  try {
    log.info('DELETE_USER', `Deleting user`, { targetId: req.params.id, by: req.user?.email });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      log.warn('DELETE_USER', `User not found: ${req.params.id}`);
      return next({ statusCode: 404, message: 'User not found' });
    }

    log.success('DELETE_USER', `User deleted: ${user.email}`);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    log.error('DELETE_USER', 'Failed to delete user', err);
    next({ statusCode: 400, message: err.message });
  }
};