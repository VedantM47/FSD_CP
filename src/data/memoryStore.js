import { normalizeScores } from "../services/normalization.service.js";
import { calculateFinalScores } from "../services/finalScore.service.js";

export let scores = [];

export function addScore(entry) {
  scores = scores.filter(
    (s) => !(s.judgeId === entry.judgeId && s.teamId === entry.teamId),
  );
  scores.push(entry);
}

export function computeLeaderboard() {
  if (scores.length === 0) return [];

  const normalized = normalizeScores(scores);
  const finals = calculateFinalScores(normalized);

  return finals
    .sort((a, b) => b.finalScore - a.finalScore)
    .map((r, i) => ({ rank: i + 1, ...r }));
}
