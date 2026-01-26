import ProblemStatement from '../models/ProblemStatement.js';
import ProblemMetadata from '../models/ProblemMetadata.js';
import ProblemEmbedding from '../models/ProblemEmbedding.js';
import embeddingService from '../services/embeddingService.js';
import { extractProblemMetadata } from '../services/nlpService.js';

/**
 * Create a new problem statement
 * POST /api/problems
 */
export const createProblem = async (req, res) => {
  try {
    const { source, title, description } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
      });
    }

    // Create problem statement
    const problem = new ProblemStatement({
      source: source || 'platform',
      title: title || '',
      description,
    });

    await problem.save();

    // Process problem offline: Extract metadata and generate embedding
    // This can be done asynchronously, but we'll do it synchronously for now
    try {
      const metadata = await extractProblemMetadata(problem._id, description);
      
      const problemMetadata = new ProblemMetadata({
        problemId: problem._id,
        domains: metadata.domains,
        requiredSkills: metadata.requiredSkills,
        difficulty: metadata.difficulty,
        keywords: metadata.keywords,
      });

      await problemMetadata.save();

      // Generate and save embedding
      await embeddingService.generateAndSaveEmbedding(problem._id, description);
    } catch (processingError) {
      console.error('Error processing problem metadata:', processingError);
      // Don't fail the request if processing fails
    }

    res.status(201).json({
      success: true,
      message: 'Problem statement created successfully',
      data: problem,
    });
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating problem statement',
      error: error.message,
    });
  }
};

/**
 * Get all problem statements
 * GET /api/problems
 */
export const getProblems = async (req, res) => {
  try {
    const { source, limit = 50, skip = 0 } = req.query;

    const query = {};
    if (source) {
      query.source = source;
    }

    const problems = await ProblemStatement.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 })
      .lean();

    // Get metadata for each problem
    const problemIds = problems.map(p => p._id);
    const metadataList = await ProblemMetadata.find({
      problemId: { $in: problemIds },
    }).lean();

    const metadataMap = new Map(
      metadataList.map(m => [m.problemId.toString(), m])
    );

    const problemsWithMetadata = problems.map(problem => ({
      ...problem,
      metadata: metadataMap.get(problem._id.toString()) || null,
    }));

    res.json({
      success: true,
      count: problemsWithMetadata.length,
      data: problemsWithMetadata,
    });
  } catch (error) {
    console.error('Error getting problems:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching problem statements',
      error: error.message,
    });
  }
};

/**
 * Get a single problem statement by ID
 * GET /api/problems/:id
 */
export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await ProblemStatement.findById(id).lean();
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem statement not found',
      });
    }

    const metadata = await ProblemMetadata.findOne({ problemId: id }).lean();

    res.json({
      success: true,
      data: {
        ...problem,
        metadata: metadata || null,
      },
    });
  } catch (error) {
    console.error('Error getting problem:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching problem statement',
      error: error.message,
    });
  }
};

/**
 * Update a problem statement
 * PUT /api/problems/:id
 */
export const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, source } = req.body;

    const problem = await ProblemStatement.findById(id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem statement not found',
      });
    }

    if (title) problem.title = title;
    if (description) problem.description = description;
    if (source) problem.source = source;

    await problem.save();

    // Reprocess metadata and embedding if description changed
    if (description) {
      try {
        const metadata = await extractProblemMetadata(problem._id, description);
        
        await ProblemMetadata.findOneAndUpdate(
          { problemId: problem._id },
          {
            domains: metadata.domains,
            requiredSkills: metadata.requiredSkills,
            difficulty: metadata.difficulty,
            keywords: metadata.keywords,
          },
          { upsert: true }
        );

        await embeddingService.generateAndSaveEmbedding(problem._id, description);
      } catch (processingError) {
        console.error('Error reprocessing problem:', processingError);
      }
    }

    res.json({
      success: true,
      message: 'Problem statement updated successfully',
      data: problem,
    });
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating problem statement',
      error: error.message,
    });
  }
};

/**
 * Delete a problem statement
 * DELETE /api/problems/:id
 */
export const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await ProblemStatement.findByIdAndDelete(id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem statement not found',
      });
    }

    // Clean up related data
    await ProblemMetadata.deleteOne({ problemId: id });
    await ProblemEmbedding.deleteOne({ problemId: id });

    res.json({
      success: true,
      message: 'Problem statement deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting problem statement',
      error: error.message,
    });
  }
};

