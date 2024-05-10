const express = require('express');
const router = express.Router();
const app = require('../app');
const jwt = require("jsonwebtoken");

const passport = require('passport');
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: 'http://localhost:3000/loggedInSuccess',
    failureRedirect: '/login/failed',
  })
);

router.get('/login/success', (req, res) => {
  if (req.user) {
    res.status(200).json({
        googleId: req.user.id,
        email: req.user.email,
        fName: req.user.displayName,
        token: generateToken(req.user._id),
        verified: true,
        isAdmin: false,
        profilePicture: req.user.picture,
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

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
  };
module.exports = router;
