const Config = require('../models/configSchema');
const createError = require("http-errors")


const addConfigValue = async (req, res) => {
  const { name, value } = req.body
  if (!name || !value) throw new createError(400, "name and value required")

  const filter = { name }
  const update = { value }

  const result = await Config.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });

  res.status(201).json({ status: true, result: result, message: 'Ok' })
}

const getConfigList = async (req, res) => {
  const allConfigs = await Config.find({}, 'name value');
  res.status(200).json({ status: true, result: allConfigs, message: 'Ok' });
}

const getConfigByName = async (req, res) => {
  const name = req.params.name

  const config = await Config.findOne({ name });

  if (config) 
    res.status(200).json({ status: true, result: config.value, message: 'Ok' });
  else 
    res.status(404).json({ status: false, message: 'Config not found' });
};

module.exports = {
 
  addConfigValue,
  getConfigByName,
  getConfigList,
}