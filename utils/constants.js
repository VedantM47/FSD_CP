// API Response Constants
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Default values
export const DEFAULTS = {
  RECOMMENDATION_LIMIT: 10,
  CANDIDATE_LIMIT: 50,
  EMBEDDING_DIMENSION: 100,
  PROBLEM_LIMIT: 50,
};

// Error messages
export const ERROR_MESSAGES = {
  TEAM_NOT_FOUND: 'Team not found',
  PROBLEM_NOT_FOUND: 'Problem statement not found',
  PROFILE_NOT_FOUND: 'Team skill profile not found',
  INVALID_INPUT: 'Invalid input provided',
  PROCESSING_ERROR: 'Error processing request',
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROBLEM_CREATED: 'Problem statement created successfully',
  PROBLEM_UPDATED: 'Problem statement updated successfully',
  PROBLEM_DELETED: 'Problem statement deleted successfully',
  SKILLS_EXTRACTED: 'Team skills extracted successfully',
  RECOMMENDATIONS_GENERATED: 'Recommendations generated successfully',
};

