import natural from 'natural';
import compromise from 'compromise';

// Common tech skills dictionary
const TECH_SKILLS = [
  'javascript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby',
  'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
  'mongodb', 'mysql', 'postgresql', 'redis', 'sqlite',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
  'machine learning', 'deep learning', 'nlp', 'computer vision', 'ai',
  'blockchain', 'web3', 'solidity',
  'android', 'ios', 'react native', 'flutter',
  'git', 'github', 'gitlab',
  'html', 'css', 'sass', 'bootstrap', 'tailwind',
  'typescript', 'graphql', 'rest api',
  'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy'
];

// Domain categories
const DOMAINS = [
  'web development', 'mobile development', 'backend development', 'frontend development',
  'full stack development', 'data science', 'machine learning', 'artificial intelligence',
  'cybersecurity', 'blockchain', 'cloud computing', 'devops',
  'iot', 'embedded systems', 'game development', 'ui/ux design',
  'fintech', 'healthtech', 'edtech', 'e-commerce', 'social media',
  'automation', 'robotics', 'ar/vr', 'augmented reality', 'virtual reality'
];

// Tools dictionary
const TOOLS = [
  'vscode', 'intellij', 'eclipse', 'android studio', 'xcode',
  'postman', 'insomnia', 'swagger',
  'figma', 'adobe xd', 'sketch',
  'jira', 'trello', 'asana',
  'slack', 'discord', 'teams'
];

// Heuristic phrase-to-skill/domain mapper for vague descriptions
const PHRASE_SKILL_MAP = [
  {
    phrases: ['interactive ui', 'interactive front-end', 'interactive frontend', 'interactive dashboard'],
    addSkills: ['javascript', 'react'],
    addDomains: ['frontend development', 'web development', 'ui/ux design'],
  },
  {
    phrases: ['clean ui', 'simple ui', 'modern ui', 'beautiful ui', 'attractive ui'],
    addSkills: ['css', 'tailwind', 'ui/ux'],
    addDomains: ['frontend development', 'ui/ux design'],
  },
  {
    phrases: ['responsive', 'responsive design', 'responsive web', 'mobile friendly'],
    addSkills: ['css', 'javascript'],
    addDomains: ['frontend development', 'web development'],
  },
  {
    phrases: ['dashboard', 'analytics dashboard', 'charts'],
    addSkills: ['react', 'javascript'],
    addDomains: ['web development', 'frontend development', 'data visualization'],
  },
  {
    phrases: ['api', 'rest api', 'backend'],
    addSkills: ['node', 'express'],
    addDomains: ['backend development', 'web development'],
  },
  {
    phrases: ['database', 'data store', 'persistence'],
    addSkills: ['mongodb', 'mysql', 'postgresql'],
    addDomains: ['backend development'],
  },
  {
    phrases: ['ai', 'machine learning', 'ml model', 'predict'],
    addSkills: ['python', 'machine learning'],
    addDomains: ['machine learning', 'artificial intelligence', 'data science'],
  },
  {
    phrases: ['map integration', 'maps', 'geo', 'location'],
    addSkills: ['javascript'],
    addDomains: ['web development'],
  },
];

/**
 * Extract skills from text using NLP techniques
 * @param {string} text - Input text to extract skills from
 * @returns {Array<string>} - Array of extracted skills
 */
export const extractSkills = (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const lowerText = text.toLowerCase();
  const extracted = new Set();

  // Direct matching with tech skills dictionary
  TECH_SKILLS.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      extracted.add(skill);
    }
  });

  // Use natural language processing for additional extraction
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(lowerText);

  // Check for skill patterns
  tokens.forEach((token, index) => {
    // Check for multi-word skills
    if (index < tokens.length - 1) {
      const bigram = `${token} ${tokens[index + 1]}`;
      TECH_SKILLS.forEach(skill => {
        if (skill.toLowerCase().includes(bigram) || bigram.includes(skill.toLowerCase())) {
          extracted.add(skill);
        }
      });
    }
  });

  // Use compromise for named entity recognition
  try {
    const doc = compromise(text);
    const nouns = doc.nouns().out('array');
    nouns.forEach(noun => {
      const lowerNoun = noun.toLowerCase();
      TECH_SKILLS.forEach(skill => {
        if (lowerNoun.includes(skill.toLowerCase()) || skill.toLowerCase().includes(lowerNoun)) {
          extracted.add(skill);
        }
      });
    });
  } catch (error) {
    console.error('Error in compromise processing:', error);
  }

  return Array.from(extracted);
};

/**
 * Extract domains from text
 * @param {string} text - Input text to extract domains from
 * @returns {Array<string>} - Array of extracted domains
 */
export const extractDomains = (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const lowerText = text.toLowerCase();
  const extracted = new Set();

  DOMAINS.forEach(domain => {
    if (lowerText.includes(domain.toLowerCase())) {
      extracted.add(domain);
    }
  });

  return Array.from(extracted);
};

/**
 * Extract tools from text
 * @param {string} text - Input text to extract tools from
 * @returns {Array<string>} - Array of extracted tools
 */
export const extractTools = (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const lowerText = text.toLowerCase();
  const extracted = new Set();

  TOOLS.forEach(tool => {
    if (lowerText.includes(tool.toLowerCase())) {
      extracted.add(tool);
    }
  });

  return Array.from(extracted);
};

/**
 * Extract all information (skills, domains, tools) from text
 * @param {string} text - Input text
 * @returns {Object} - Object containing skills, domains, and tools
 */
export const extractAll = (text) => {
  const base = {
    skills: extractSkills(text),
    domains: extractDomains(text),
    tools: extractTools(text),
  };

  const lower = (text || '').toLowerCase();

  // Heuristic enrichment based on phrases
  for (const rule of PHRASE_SKILL_MAP) {
    if (rule.phrases.some(p => lower.includes(p))) {
      if (rule.addSkills) base.skills.push(...rule.addSkills);
      if (rule.addDomains) base.domains.push(...rule.addDomains);
    }
  }

  // If still empty, add generic web/frontend signals when UI/interactive words are present
  if (base.skills.length === 0) {
    if (lower.includes('ui') || lower.includes('frontend') || lower.includes('front-end') || lower.includes('interactive') || lower.includes('responsive')) {
      base.skills.push('javascript', 'css', 'react');
    }
  }
  if (base.domains.length === 0) {
    if (lower.includes('ui') || lower.includes('frontend') || lower.includes('front-end') || lower.includes('web')) {
      base.domains.push('frontend development', 'web development', 'ui/ux design');
    }
  }

  // De-duplicate
  base.skills = [...new Set(base.skills)];
  base.domains = [...new Set(base.domains)];
  base.tools = [...new Set(base.tools)];

  return base;
};

