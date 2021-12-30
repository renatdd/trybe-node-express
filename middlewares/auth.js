const errors = require('../errors');
const {
  getToken,
  validateEmail,
  validatePassword,
  // storeUserData,
  // getUserData,
} = require('../services');

const login = (req, res, next) => {
  const { email, password } = req.body;
  const token = getToken();

  switch (true) {
    case !email:
      return next(errors.emailMissing);
    case !password:
      return next(errors.passwordMissing);
    case !validateEmail(email):
      return next(errors.emailInvalid);
    case !validatePassword(password):
      return next(errors.passwordInvalid);
    default:
      // storeUserData({ user: email, token });
      return res.status(200).json({ token });
  }
};

const authenticateUser = async (req, res, next) => {
  const { headers: { authorization } } = req;
  // const { token } = await getUserData();
  // console.log('token', authorization);
  // const tokenIsValid = token === authorization;
  switch (true) {
    case !authorization:
      return next(errors.tokenMissing);
    case authorization.length !== 16:
      return next(errors.tokenInvalid);
    default:
      return next();
  }
};

module.exports = {
  login,
  authenticateUser,
};
