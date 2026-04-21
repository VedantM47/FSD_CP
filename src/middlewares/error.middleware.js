import log from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Log full error details
  const logData = {
    statusCode: err.statusCode,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    params: req.params,
    query: req.query,
    userId: req.user?._id || 'unauthenticated',
  };

  if (err.statusCode >= 500) {
    log.error('ERROR', `${err.statusCode} ${req.method} ${req.originalUrl} — ${err.message}`, err);
    log.info('ERROR', 'Request details:', logData);
  } else {
    log.warn('ERROR', `${err.statusCode} ${req.method} ${req.originalUrl} — ${err.message}`);
    log.info('ERROR', 'Request details:', logData);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

export default errorHandler;