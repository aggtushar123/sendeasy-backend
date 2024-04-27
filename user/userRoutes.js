const express = require('express');
const router = express.Router();
const app = require('../app');

const passport = require('passport');
const {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  sendOtp,
  getUser,
} = require('./userController');

router.post('/signup', registerUser);
router.post('/verifyOTP', verifyOtp);
router.post('/login', loginUser);
router.post('/resendOtpVerificationCode', resendOtp);
router.post('/sendOtp', sendOtp);
router.get('/user/:userId', getUser);


module.exports = router;
