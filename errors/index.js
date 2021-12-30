const errors = {
  talkerNotFound: { message: 'Pessoa palestrante não encontrada', status: 404 },
  emailMissing: { message: 'O campo "email" é obrigatório', status: 400 },
  emailInvalid: { message: 'O "email" deve ter o formato "email@email.com"', status: 400 },
  passwordMissing: { message: 'O campo "password" é obrigatório', status: 400 },
  passwordInvalid: { message: 'O "password" deve ter pelo menos 6 caracteres', status: 400 },
  tokenMissing: { message: 'Token não encontrado', status: 401 },
  tokenInvalid: { message: 'Token inválido', status: 401 },
  nameMissing: { message: 'O campo "name" é obrigatório', status: 400 },
  nameInvalid: { message: 'O "name" deve ter pelo menos 3 caracteres', status: 400 },
  ageMissing: { message: 'O campo "age" é obrigatório', status: 400 },
  ageInvalid: { message: 'A pessoa palestrante deve ser maior de idade', status: 400 },
  talkMissing: {
    message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios',
    status: 400,
  },
  watchedAtInvalid: { message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"', status: 400 },
  rateInvalid: { message: 'O campo "rate" deve ser um inteiro de 1 à 5', status: 400 },
};

module.exports = errors;
