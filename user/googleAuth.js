const express = require("express");
const router = express.Router();
const app = require("../app");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/auth/google/success",
    failureRedirect: "/login/failed",
  })
);

router.get("/login/success", async (req, res) => {
  if (req.user) {
    try {
      const { email } = req.user;
      const userExists = await User.findOne({ email });
      if (!userExists) {
        const user = await new User({
          email: req.user.email,
          fName: req.user.displayName,
          token: generateToken(req.user.id),
          verified: true,
          isAdmin: false,
          profilePicture: req.user.picture,
        });
        const createdUser = await user.save();
        
        res.status(200).json({
          user: createdUser,
        });
      }
    } catch (error) {
      console.log("Error in login/success route:", error);
      res.status(500).json({ error: true, message: "Server error" });
    }
  } else {
    res.status(403).json({ error: true, message: "Not authorized" });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
});

router.get("logout", (req, res) => {
  req.logOut();
  res.redirect(process.env.CLIENT_URL);
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
module.exports = router;
