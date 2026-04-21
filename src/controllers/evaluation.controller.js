import Evaluation from '../models/evaluation.model.js';
import log from '../utils/logger.js';

export const createEvaluation = async (req, res, next) => {
  try {
    log.info('CREATE_EVAL', 'Creating evaluation', { hackathonId: req.params.hackathonId, teamId: req.params.teamId, by: req.user?.email });

    const evaluation = await Evaluation.create({
      ...req.body,
      hackathonId: req.params.hackathonId,
      teamId: req.params.teamId,
      judgeId: req.user._id,
      evaluatedByRole: req.user.systemRole === 'admin'
        ? 'admin'
        : req.user.systemRole === 'faculty'
        ? 'faculty'
        : 'judge',
    });

    log.success('CREATE_EVAL', `Evaluation created (id=${evaluation._id})`);
    res.status(201).json({
      success: true,
      data: evaluation,
    });
  } catch (err) {
    log.error('CREATE_EVAL', 'Failed to create evaluation', err);
    next({
      statusCode: 400,
      message: err.message,
    });
  }
};

export const updateEvaluation = async (req, res, next) => {
  try {
    log.info('UPDATE_EVAL', 'Updating evaluation', { evaluationId: req.params.evaluationId, fields: Object.keys(req.body), by: req.user?.email });

    const evaluation = await Evaluation.findById(req.params.evaluationId);

    if (!evaluation) {
      log.warn('UPDATE_EVAL', `Not found: ${req.params.evaluationId}`);
      return next({
        statusCode: 404,
        message: 'Evaluation not found',
      });
    }

    Object.assign(evaluation, req.body);
    evaluation.lastUpdatedAt = new Date();

    await evaluation.save();

    log.success('UPDATE_EVAL', `Evaluation updated (id=${evaluation._id})`);
    res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (err) {
    log.error('UPDATE_EVAL', 'Failed to update evaluation', err);
    next({
      statusCode: 400,
      message: err.message,
    });
  }
};

export const lockEvaluation = async (req, res, next) => {
  try {
    log.info('LOCK_EVAL', 'Locking evaluation', { evaluationId: req.params.evaluationId, by: req.user?.email });

    const evaluation = await Evaluation.findByIdAndUpdate(
      req.params.evaluationId,
      { status: 'locked', isFinal: true },
      { new: true }
    );

    if (!evaluation) {
      log.warn('LOCK_EVAL', `Not found: ${req.params.evaluationId}`);
      return next({
        statusCode: 404,
        message: 'Evaluation not found',
      });
    }

    log.success('LOCK_EVAL', `Evaluation locked (id=${evaluation._id})`);
    res.status(200).json({
      success: true,
      message: 'Evaluation locked successfully',
    });
  } catch (err) {
    log.error('LOCK_EVAL', 'Failed to lock evaluation', err);
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

export const getEvaluationsByTeam = async (req, res, next) => {
  try {
    log.info('GET_EVALS', 'Fetching evaluations', { hackathonId: req.params.hackathonId, teamId: req.params.teamId, by: req.user?.email });

    const evaluations = await Evaluation.find({
      hackathonId: req.params.hackathonId,
      teamId: req.params.teamId,
    }).populate('judgeId', 'fullName email');

    log.success('GET_EVALS', `Found ${evaluations.length} evaluations`);
    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations,
    });
  } catch (err) {
    log.error('GET_EVALS', 'Failed to fetch evaluations', err);
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};


export const deleteEvaluation = async (req, res, next) => {
  try {
    log.info('DELETE_EVAL', 'Deleting evaluation', { evaluationId: req.params.evaluationId, by: req.user?.email });

    const evaluation = await Evaluation.findByIdAndDelete(req.params.evaluationId);

    if (!evaluation) {
      log.warn('DELETE_EVAL', `Not found: ${req.params.evaluationId}`);
    } else {
      log.success('DELETE_EVAL', `Evaluation deleted (id=${req.params.evaluationId})`);
    }

    res.status(200).json({
      success: true,
      message: 'Evaluation deleted successfully',
    });
  } catch (err) {
    log.error('DELETE_EVAL', 'Failed to delete evaluation', err);
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};