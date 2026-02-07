const { calculateCheckboxScore } = require("./checkboxScore");

function calculateFinalScores(entries) {
  return entries.map(e => {
    const checkboxScore = calculateCheckboxScore(e.checkboxes);
    const aiScore = 0; // placeholder

    const finalScore =
      0.60 * e.normRawScore +
      0.30 * checkboxScore +
      0.10 * aiScore;

    return {
      teamId: e.teamId,
      judgeId: e.judgeId,
      rawScore: e.rawTotal,
      normRawScore: Number(e.normRawScore.toFixed(2)),
      checkboxScore,
      aiScore,
      finalScore: Number(finalScore.toFixed(2))
    };
  });
}

module.exports = { calculateFinalScores };
