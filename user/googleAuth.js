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
    failureRedirect: "http://localhost:3000/signup",
  })
);

router.get("/login/success", async (req, res) => {
  if (req.user) {
    try {
      const { email } = req.user;
      const userExists = await User.findOne({ email });

      if (userExists) {
        res.status(200).json({
          user: userExists,
        });
      } else {
        
        const user = await new User({
          email: req.user.email,
          fName: req.user.displayName,
          verified: true,
          isAdmin: false,
          profilePicture: req.user.picture,
        });
        const savedUser = await user.save();

        // Generate a token for the new user
        const token = generateToken(savedUser._id);

        // Update the user with the generated token
        savedUser.token = token;
        const updatedUser = await savedUser.save();

        // Send the updated user to the frontend
        res.status(200).json(updatedUser);
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

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect(process.env.CLIENT_URL);
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
module.exports = router;
