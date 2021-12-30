const fs = require('fs');
const errors = require('../errors');
const {
  validateTalkerNameAndAge,
  validateTalkerTalk,
  storeTalkerData,
} = require('../services');

const getData = async () => {
  const content = await fs.promises.readFile('./talker.json');
  return JSON.parse(content);
};

const getAll = async (req, res) => res.status(200).json(await getData());

const getById = async (req, res, next) => {
    const { params: { id } } = req;
    const data = await getData();
    const result = data.filter((talker) => talker.id === Number(id));
    if (result.length === 0) {
      next(errors.talkerNotFound);
    }
    res.status(200).json(...result);
};

const validateData = async (req, res, next) => {
  const { name, age, talk } = req.body;
  validateTalkerNameAndAge({ name, age, next });
  validateTalkerTalk({ talk, next });
  next();
};

const create = async (req, res, _next) => {
  const data = await getData();
  const newTalker = { ...req.body, id: data.length + 1 };
  const newTalkerData = [...data, newTalker];
  storeTalkerData(newTalkerData);
  res.status(201).json(newTalker);
};

const update = async (req, res, _next) => {
  const { params: { id } } = req;
  const data = await getData();
  const result = data.filter((talker) => talker.id !== Number(id));
  const updatedTalker = { ...req.body, id: Number(id) };
  const newTalkerData = [...result, updatedTalker];
  storeTalkerData(newTalkerData);
  res.status(200).json(updatedTalker);
};

const remove = async (req, res, _next) => {
  const { params: { id } } = req;
  const data = await getData();
  const result = data.filter((talker) => talker.id !== Number(id));
  storeTalkerData(result);
  res.status(200).json({ message: 'Pessoa palestrante deletada com sucesso' });
};

const search = async (req, res, _next) => {
  const { query: { q: searchTerm } } = req;
  const data = await getData();
  const result = !searchTerm
    ? data
    : data.filter(({ name }) => !!name.match(new RegExp(searchTerm, 'i')));
  res.status(200).json(result);
};
  
module.exports = {
  getAll,
  getById,
  validateData,
  create,
  update,
  remove,
  search,
};
