const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  teamName: { type: String, required: true },
  teamNationality: { type: String, required: true },
});

module.exports = mongoose.model('Manager', managerSchema);
