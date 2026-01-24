const { normalizeScores } = require("../services/normalization");
const { calculateFinalScores } = require("../services/finalscore");

let scores = [];

function addScore(entry) {
  scores = scores.filter(
    s => !(s.judgeId === entry.judgeId && s.teamId === entry.teamId)
  );
  scores.push(entry);
}

function computeLeaderboard() {
  if (scores.length === 0) return [];

  const normalized = normalizeScores(scores);
  const finals = calculateFinalScores(normalized);

  return finals
    .sort((a, b) => b.finalScore - a.finalScore)
    .map((r, i) => ({ rank: i + 1, ...r }));
}

module.exports = { addScore, computeLeaderboard };
