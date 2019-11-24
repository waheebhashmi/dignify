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
 date: {
  type: Date,
  required: true
 },
 time: {
type: String,
required: true
 },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
 
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },

});

const User = mongoose.model('User', UserSchema);

module.exports = User;
