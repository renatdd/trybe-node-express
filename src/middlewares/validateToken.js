const { auth } = require('../utils');

module.exports = async (req, _res, next) => {
  const { authorization } = req.headers;

  if (!authorization) return next({ type: 'missingToken' });

  try {
    const { email, displayName } = auth.validateToken(authorization);
    req.userEmail = email;
    req.userName = displayName;
    next();
  } catch (error) {
    return next({ type: 'invalidToken' });
  }
};
