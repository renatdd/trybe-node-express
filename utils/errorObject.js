module.exports = (...params) => {
  let [code, message] = params;
  if (message.isJoi) message = message.details[0].message;

  return { err: { code, message } };
};
