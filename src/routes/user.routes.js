import express from "express";
import auth from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.js";

import {
  register,
  login,
  logout,
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  deleteUser,
  searchUsers,
} from "../controllers/user.controller.js";

const router = express.Router();

/* ======================================================
   PUBLIC ROUTES (NO AUTH REQUIRED)
====================================================== */

router.post("/register", register);
router.post("/login", login);

/* ======================================================
   PROTECTED USER ROUTES (AUTH REQUIRED)
====================================================== */

router.post("/logout", auth, logout);

router.get("/me", auth, getMe);
router.put("/me", auth, updateMe);

router.get("/search", auth, searchUsers);

/* ======================================================
   ADMIN ROUTES (AUTH + AUTHORIZE)
====================================================== */

router.get(
  "/",
  auth,
  authorize("VIEW_ALL_USERS", async (req) => ({
    user: req.user,
  })),
  getAllUsers
);

router.get(
  "/:id",
  auth,
  authorize("VIEW_USER_BY_ID", async (req) => ({
    user: req.user,
    targetUserId: req.params.id,
  })),
  getUserById
);

router.delete(
  "/:id",
  auth,
  authorize("DELETE_USER", async (req) => ({
    user: req.user,
    targetUserId: req.params.id,
  })),
  deleteUser
);

export default router;