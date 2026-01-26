import { pipeline, env } from '@xenova/transformers';
import path from 'path';
import User from '../models/user.model.js';

// Configuration: Store downloaded AI models locally in the project folder
env.cacheDir = path.resolve('./models');

let extractor = null;

/*
  Functionality: Singleton Model Loader
  Ensures the AI model is loaded only once to save memory.
*/
const getExtractor = async () => {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
};

/*
  Functionality: Cosine Similarity Helper
  Calculates the mathematical similarity between two vectors.
  
  Input: Two arrays of numbers (vectors)
  Returns: Similarity score (0 to 1)
*/
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  return (magA && magB) ? dotProduct / (magA * magB) : 0;
};

/*
  Functionality: Generate User Embedding
  Combines user skills, bio, and department into a text string, converts it 
  to a vector using the AI model, and saves it to the database.
  
  Input: userId
  Returns: Length of the generated vector (for verification)
*/
export const generateUserEmbedding = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const pipe = await getExtractor();
  
  // Combine profile fields for context
  const text = `
    Skills: ${user.skills.join(', ') || ''}. 
    About: ${user.bio || ''}. 
    Department: ${user.department || ''}
  `;

  const output = await pipe(text, { pooling: 'mean', normalize: true });
  const embedding = Array.from(output.data);

  // Save vector to DB
  user.embedding = embedding;
  await user.save();
  
  return embedding.length;
};

/*
  Functionality: Search Similar Users
  Converts a search query into a vector and compares it against all user 
  embeddings in the database to find the best matches.
  
  Input: Search query string
  Returns: Top 10 matching users with similarity scores
*/
export const searchSimilarUsers = async (query) => {
  const pipe = await getExtractor();
  
  // Embed the search query
  const output = await pipe(query, { pooling: 'mean', normalize: true });
  const queryVector = Array.from(output.data);

  // Fetch users that have an embedding generated
  const users = await User.find({ embedding: { $exists: true, $ne: [] } })
    .select('+embedding fullName email skills bio');

  // Calculate similarity scores
  const results = users.map(user => {
    const score = cosineSimilarity(queryVector, user.embedding);
    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      skills: user.skills,
      score: score
    };
  });

  // Sort by highest score and return top 10
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
};