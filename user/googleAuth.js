const express = require('express');
const router = express.Router();
const app = require('../app');

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
    // console.log(req);
    if (req.user) {
      const user = {
        googleId: req.user.id,
        email: req.user.email,
        fName: req.user.displayName,
        verified: true,
        isAdmin: false,
      };
      res.status(200).json({
        error: false,
        message: 'Successfully logged in',
        user: user,
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