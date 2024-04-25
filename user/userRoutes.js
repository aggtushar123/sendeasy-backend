const express = require('express');
const router = express.Router();
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
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: 'http://localhost:3000/',
    failureRedirect: '/login/failed',
  })
);

router.get('/login/success', (req, res) => {
  console.log(req);
  if (req.user) {
    res.status(200).json({
      error: false,
      message: 'Successfully logged in',
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: 'Not authorized' });
  }
});

router.get('/login/failed', (req, res) => {
  res.status(401).json({
    error: true,
    message: 'Log in failure',
  });
});

router.get('logout', (req, res) => {
  req.logOut();
  res.redirect(process.env.CLIENT_URL);
});

module.exports = router;
