import express from "express";
import { addScore } from "../data/memoryStore.js";
const router = express.Router();

router.post("/submit", (req, res) => {
  store.addScore(req.body);
  res.json({ message: "Score submitted" });
});

router.get("/leaderboard", (req, res) => {
  res.json(store.computeLeaderboard());
});

export default router;
