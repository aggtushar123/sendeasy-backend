const mongoose = require("mongoose");
const LuggageListing = require('./luggageListing');
const TravelerListing = require('./travelerListing');
const userSchema = mongoose.Schema(
  {
    fName: {
      type: String,
      required: [true, "Please add First Name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
    },
    password: {
      type: String,
      // required: [true, 'Please add a Password']
    },
    mobile: {
      type: String,
      default: "",
    },

    kycDocument: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    dob: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    occupation: {
      type: String,
      default: "",
    },
    workplace: {
      type: String,
      default: "",
    },
    workplaceEmail: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
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
      required: [true, "Please verify using OTP"],
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
    token: {
      type: String,
      default: ""
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre('remove', async function(next) {
  try {
    await LuggageListing.deleteMany({ user: this._id });
    next();
  } catch (error) {
    next(error);
  }
});
userSchema.pre('remove', async function(next) {
  try {
    await TravelerListing.deleteMany({ user: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
