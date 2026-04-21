export const WEIGHTS = {
  C1: 6,
  C2: 5,
  C3: 4,
  C4: 4,
  C5: 3,
  C6: 3,
  C7: 2,
  C8: 1,
};

export function calculateCheckboxScore(list) {
  return list.reduce((sum, c) => sum + (WEIGHTS[c] || 0), 0);
}
