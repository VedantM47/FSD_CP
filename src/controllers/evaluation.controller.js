import Evaluation from '../models/evaluation.model.js';

export const createEvaluation = async (req, res, next) => {
  try {
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

    res.status(201).json({
      success: true,
      data: evaluation,
    });
  } catch (err) {
    next({
      statusCode: 400,
      message: err.message,
    });
  }
};

export const updateEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findById(req.params.evaluationId);

    if (!evaluation) {
      return next({
        statusCode: 404,
        message: 'Evaluation not found',
      });
    }

    Object.assign(evaluation, req.body);
    evaluation.lastUpdatedAt = new Date();

    await evaluation.save();

    res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (err) {
    next({
      statusCode: 400,
      message: err.message,
    });
  }
};

export const lockEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findByIdAndUpdate(
      req.params.evaluationId,
      { status: 'locked', isFinal: true },
      { new: true }
    );

    if (!evaluation) {
      return next({
        statusCode: 404,
        message: 'Evaluation not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Evaluation locked successfully',
    });
  } catch (err) {
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

export const getEvaluationsByTeam = async (req, res, next) => {
  try {
    const evaluations = await Evaluation.find({
      hackathonId: req.params.hackathonId,
      teamId: req.params.teamId,
    }).populate('judgeId', 'fullName email');

    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations,
    });
  } catch (err) {
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};


export const deleteEvaluation = async (req, res, next) => {
  try {
    await Evaluation.findByIdAndDelete(req.params.evaluationId);

    res.status(200).json({
      success: true,
      message: 'Evaluation deleted successfully',
    });
  } catch (err) {
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};