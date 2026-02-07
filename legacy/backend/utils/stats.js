function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr, mu) {
  const variance =
    arr.reduce((s, x) => s + Math.pow(x - mu, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

module.exports = { mean, stdDev, clamp };
