// Skill extraction utilities for AI recommendation system

const SKILL_KEYWORDS = {
  programming: [
    'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift',
    'kotlin', 'typescript', 'php', 'scala', 'r', 'matlab', 'perl', 'dart'
  ],
  web: [
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
    'laravel', 'rails', 'nextjs', 'nuxt', 'svelte', 'html', 'css', 'sass',
    'tailwind', 'bootstrap', 'webpack', 'vite'
  ],
  mobile: [
    'android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic', 'cordova'
  ],
  database: [
    'mongodb', 'mysql', 'postgresql', 'redis', 'cassandra', 'dynamodb',
    'firebase', 'sql', 'nosql', 'elasticsearch'
  ],
  cloud: [
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins',
    'ci/cd', 'devops', 'serverless'
  ],
  ai_ml: [
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
    'scikit-learn', 'nlp', 'computer vision', 'neural networks', 'ai'
  ],
  tools: [
    'git', 'github', 'gitlab', 'jira', 'figma', 'postman', 'vscode', 'intellij'
  ]
};

const DOMAIN_KEYWORDS = {
  'web development': ['web', 'frontend', 'backend', 'fullstack', 'website', 'webapp'],
  'mobile development': ['mobile', 'android', 'ios', 'app'],
  'data science': ['data', 'analytics', 'visualization', 'statistics', 'ml'],
  'artificial intelligence': ['ai', 'machine learning', 'deep learning', 'neural', 'nlp'],
  'blockchain': ['blockchain', 'crypto', 'ethereum', 'smart contract', 'web3'],
  'iot': ['iot', 'internet of things', 'embedded', 'sensor', 'arduino', 'raspberry'],
  'cybersecurity': ['security', 'encryption', 'authentication', 'vulnerability', 'penetration'],
  'game development': ['game', 'unity', 'unreal', 'gaming', 'graphics'],
  'cloud computing': ['cloud', 'aws', 'azure', 'gcp', 'serverless'],
  'devops': ['devops', 'ci/cd', 'deployment', 'automation', 'infrastructure']
};

/**
 * Extract skills from text
 * @param {string} text - Input text to extract skills from
 * @returns {string[]} - Array of extracted skills
 */
export const extractSkills = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const lowerText = text.toLowerCase();
  const foundSkills = new Set();

  // Check all skill categories
  Object.values(SKILL_KEYWORDS).flat().forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.add(skill);
    }
  });

  return Array.from(foundSkills);
};

/**
 * Extract domains from text
 * @param {string} text - Input text to extract domains from
 * @returns {string[]} - Array of extracted domains
 */
export const extractDomains = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const lowerText = text.toLowerCase();
  const foundDomains = new Set();

  Object.entries(DOMAIN_KEYWORDS).forEach(([domain, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      foundDomains.add(domain);
    }
  });

  return Array.from(foundDomains);
};

/**
 * Extract tools from text
 * @param {string} text - Input text to extract tools from
 * @returns {string[]} - Array of extracted tools
 */
export const extractTools = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const lowerText = text.toLowerCase();
  const foundTools = new Set();

  SKILL_KEYWORDS.tools.forEach(tool => {
    if (lowerText.includes(tool.toLowerCase())) {
      foundTools.add(tool);
    }
  });

  return Array.from(foundTools);
};

/**
 * Extract all information (skills, domains, tools) from text
 * @param {string} text - Input text
 * @returns {Object} - Object containing skills, domains, and tools
 */
export const extractAll = (text) => {
  return {
    skills: extractSkills(text),
    domains: extractDomains(text),
    tools: extractTools(text)
  };
};
