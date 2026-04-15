import { mean, stdDev, clamp } from "../utils/stats.js";

export function normalizeScores(entries) {
  const byJudge = {};

  entries.forEach((e) => {
    e.rawTotal = e.raw.reduce((a, b) => a + b, 0);
    if (!byJudge[e.judgeId]) byJudge[e.judgeId] = [];
    byJudge[e.judgeId].push(e.rawTotal);
  });

  const stats = {};
  for (const j in byJudge) {
    const mu = mean(byJudge[j]);
    const sigma = stdDev(byJudge[j], mu) || 1;
    stats[j] = { mu, sigma };
  }

  return entries.map((e) => {
    const { mu, sigma } = stats[e.judgeId];
    let z = (e.rawTotal - mu) / sigma;
    z = clamp(z, -2, 2);
    e.normRawScore = 50 + z * 15;
    return e;
  });
}
