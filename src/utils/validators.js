/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  // MongoDB ObjectId is 24 hex characters
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate problem source
 * @param {string} source - Source to validate
 * @returns {boolean} - True if valid
 */
export const isValidSource = (source) => {
  const validSources = ['platform', 'SIH', 'external'];
  return validSources.includes(source);
};

/**
 * Validate difficulty level
 * @param {string} difficulty - Difficulty to validate
 * @returns {boolean} - True if valid
 */
export const isValidDifficulty = (difficulty) => {
  const validDifficulties = ['easy', 'medium', 'hard'];
  return validDifficulties.includes(difficulty);
};

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  return str.trim().replace(/[<>]/g, '');
};

