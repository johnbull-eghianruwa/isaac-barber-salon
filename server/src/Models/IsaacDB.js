const mongoose = require('mongoose');

const IsaacDBSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const IsaacDBModel = mongoose.model('isaacs', IsaacDBSchema);
module.exports = IsaacDBModel;