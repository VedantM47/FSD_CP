import ProblemEmbedding from '../models/ProblemEmbedding.js';
import natural from 'natural';

/**
 * Simple TF-IDF based embedding generator
 * This is a lightweight alternative to heavy ML models
 * For production, consider using transformer models or external APIs
 */
class EmbeddingService {
  constructor() {
    this.tfidf = new natural.TfIdf();
    this.vocabulary = new Map();
    this.vocabularySize = 0;
  }

  /**
   * Generate a simple embedding vector from text using TF-IDF
   * @param {string} text - Input text
   * @param {number} dimension - Dimension of embedding (default: 100)
   * @returns {Array<number>} - Embedding vector
   */
  generateEmbedding(text, dimension = 100) {
    if (!text || typeof text !== 'string') {
      return new Array(dimension).fill(0);
    }

    // Tokenize and normalize text
    const tokenizer = new natural.WordTokenizer();
    const stemmer = natural.PorterStemmer;
    const tokens = tokenizer.tokenize(text.toLowerCase());
    const stemmedTokens = tokens.map(token => stemmer.stem(token));

    // Create TF-IDF vector
    const tfidfVector = new Array(dimension).fill(0);
    const termFreq = {};

    // Calculate term frequency
    stemmedTokens.forEach(token => {
      termFreq[token] = (termFreq[token] || 0) + 1;
    });

    // Simple hash-based embedding (deterministic)
    Object.keys(termFreq).forEach(term => {
      const hash = this.simpleHash(term);
      const index = hash % dimension;
      const tf = termFreq[term] / stemmedTokens.length;
      tfidfVector[index] += tf;
    });

    // Normalize vector
    const magnitude = Math.sqrt(tfidfVector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return tfidfVector.map(val => val / magnitude);
    }

    return tfidfVector;
  }

  /**
   * Simple hash function for deterministic embedding
   * @param {string} str - Input string
   * @returns {number} - Hash value
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Calculate cosine similarity between two embeddings
   * @param {Array<number>} vec1 - First embedding vector
   * @param {Array<number>} vec2 - Second embedding vector
   * @returns {number} - Cosine similarity score (0-1)
   */
  cosineSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same dimension');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      magnitude1 += vec1[i] * vec1[i];
      magnitude2 += vec2[i] * vec2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Generate and save embedding for a problem statement
   * @param {string} problemId - Problem statement ID
   * @param {string} text - Problem description text
   * @returns {Promise<Object>} - Saved embedding document
   */
  async generateAndSaveEmbedding(problemId, text) {
    try {
      const embedding = this.generateEmbedding(text);
      
      const embeddingDoc = await ProblemEmbedding.findOneAndUpdate(
        { problemId },
        {
          problemId,
          embedding,
          embeddingModel: 'tfidf',
          createdAt: new Date(),
        },
        { upsert: true, new: true }
      );

      return embeddingDoc;
    } catch (error) {
      console.error('Error generating and saving embedding:', error);
      throw error;
    }
  }

  /**
   * Get embedding for a problem statement
   * @param {string} problemId - Problem statement ID
   * @returns {Promise<Array<number>>} - Embedding vector
   */
  async getEmbedding(problemId) {
    try {
      const embeddingDoc = await ProblemEmbedding.findOne({ problemId });
      if (!embeddingDoc) {
        throw new Error(`Embedding not found for problem ${problemId}`);
      }
      return embeddingDoc.embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      throw error;
    }
  }
}

// Export singleton instance
const embeddingService = new EmbeddingService();
export default embeddingService;

