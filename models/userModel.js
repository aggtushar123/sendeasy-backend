const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    fName: {
      type: String,
      required: [true, 'Please add First Name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
    },
    password: {
      type: String,
      // required: [true, 'Please add a Password']
    },
    mobile: {
      type: String,
    },
    facebook: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    instagram: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      required: [true, 'Please verify using OTP'],
      default: false,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
