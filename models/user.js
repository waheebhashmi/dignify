const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name1: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true

  },
    phonenumber: {
    type: Number
 },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
 
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;