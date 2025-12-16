const adminOnly = (req, res, next) => {
  if (req.user.systemRole !== 'admin') {
    return next({
      statusCode: 403,
      message: 'Admin access only',
    });
  }
  next();
};

export default adminOnly;