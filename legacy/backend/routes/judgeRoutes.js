const express = require("express");
const router = express.Router();
const store = require("../data/memoryStore");

router.post("/submit", (req, res) => {
  store.addScore(req.body);
  res.json({ message: "Score submitted" });
});

router.get("/leaderboard", (req, res) => {
  res.json(store.computeLeaderboard());
});

module.exports = router;
