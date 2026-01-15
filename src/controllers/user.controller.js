import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt.js';


// ========================= Register User =========================
export const register = async (req, res, next) => {
  try {
    // ❌ Force systemRole to always be 'user'
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const newUser = await User.create({
      ...req.body,
      systemRole: 'user', // 🔐 override any incoming value
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      token: signToken({ id: newUser._id }),
    });
  } catch (err) {
    next({ statusCode: 400, message: err.message });
  }
};
  

// ========================= Login User =========================
export const login = async (req, res, next) => {
  try {
    //  Validate user exists first
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user) {
      return next({
        statusCode: 401,
        message: 'Invalid credentials',
      });
    }

    //  Validate password
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return next({
        statusCode: 401,
        message: 'Invalid credentials',
      });
    }

    //  Generate token AFTER all validations pass
    const token = signToken({ id: user._id });

    res.status(200).json({
      success: true,
      token: token,
    });
  } catch (err) {
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

/* ========================= Logout User ========================= */
export const logout = async (req, res) => {
  try {
    // Optional: Add token to blacklist here (Redis / DB)
    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* ================= GET SELF ================= */
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

/* ================= UPDATE SELF ================= */
export const updateMe = async (req, res, next) => {
  try {
    delete req.body.systemRole; // prevent role escalation

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    next({ statusCode: 400, message: err.message });
  }
};

/* ================= SEARCH USERS ================= */
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return next({
        statusCode: 400,
        message: 'Search query is required',
      });
    }

    const users = await User.find(
      {
        $or: [
          { fullName: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
        ],
      },
      'fullName email'
    ).limit(20);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};


/* ================= ADMIN: GET ALL USERS ================= */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next({ statusCode: 500, message: err.message });
  }
};

/* ================= ADMIN: GET USER BY ID ================= */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next({ statusCode: 404, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next({ statusCode: 400, message: err.message });
  }
};

/* ================= ADMIN: DELETE USER ================= */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next({ statusCode: 404, message: 'User not found' });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    next({ statusCode: 400, message: err.message });
  }
};