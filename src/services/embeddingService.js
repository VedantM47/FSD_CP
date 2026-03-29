import natural from 'natural';

const TfIdf = natural.TfIdf;

/**
 * Generate TF-IDF embeddings for text
 * @param {string[]} documents - Array of text documents
 * @returns {number[][]} - Array of embedding vectors
 */
export const generateEmbeddings = (documents) => {
  if (!documents || documents.length === 0) {
    return [];
  }

  const tfidf = new TfIdf();
  
  // Add all documents to TF-IDF
  documents.forEach(doc => {
    tfidf.addDocument(doc || '');
  });

  // Generate embeddings for each document
  const embeddings = [];
  documents.forEach((doc, docIndex) => {
    const embedding = [];
    const terms = tfidf.listTerms(docIndex);
    
    // Create a fixed-size vector (top 100 terms)
    const vectorSize = 100;
    for (let i = 0; i < vectorSize; i++) {
      if (i < terms.length) {
        embedding.push(terms[i].tfidf);
      } else {
        embedding.push(0);
      }
    }
    
    embeddings.push(embedding);
  });

  return embeddings;
};

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score (0-1)
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
};

/**
 * Generate embedding for a single text
 * @param {string} text - Input text
 * @param {string[]} corpus - Reference corpus for TF-IDF
 * @returns {number[]} - Embedding vector
 */
export const generateSingleEmbedding = (text, corpus = []) => {
  const documents = [...corpus, text];
  const embeddings = generateEmbeddings(documents);
  return embeddings[embeddings.length - 1];
};
