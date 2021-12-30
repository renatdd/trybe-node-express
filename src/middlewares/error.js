const errorTypes = {
  userExists: { statusCode: 409, message: 'User already registered' },
  invalidLoginData: { statusCode: 400, message: 'Invalid fields' },
  missingToken: { statusCode: 401, message: 'Token not found' },
  invalidToken: { statusCode: 401, message: 'Expired or invalid token' },
  userDoesNotExist: { statusCode: 404, message: 'User does not exist' },
  categoryNotFound: { statusCode: 400, message: '"categoryIds" not found' },
};

module.exports = async (err, _req, res, _next) => {
  if (err.isJoi) {
    return res.status(400).json({ message: err.details[0].message });
  }

  if (err.type) {
    const { statusCode, message } = errorTypes[err.type];
    return res.status(statusCode).json({ message });
  }

  console.error(err);

  return res.status(500).json({
    error: {
      message: `Internal server error: ${err.message}`,
    },
  });
};
