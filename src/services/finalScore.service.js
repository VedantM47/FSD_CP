import { calculateCheckboxScore } from "./checkboxScore.service.js";

export function calculateFinalScores(entries) {
  return entries.map((e) => {
    const checkboxScore = calculateCheckboxScore(e.checkboxes);
    const aiScore = 0; // placeholder

    const finalScore =
      0.6 * e.normRawScore + 0.3 * checkboxScore + 0.1 * aiScore;

    return {
      teamId: e.teamId,
      judgeId: e.judgeId,
      rawScore: e.rawTotal,
      normRawScore: Number(e.normRawScore.toFixed(2)),
      checkboxScore,
      aiScore,
      finalScore: Number(finalScore.toFixed(2)),
    };
  });
}
