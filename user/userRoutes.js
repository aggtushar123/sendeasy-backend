const express = require("express");
const router = express.Router();
const app = require("../app");

const passport = require("passport");
const {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  sendOtp,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getAllNotification,
  deleteAllNotification,
  bookNowTraveler,
  getAllNotifications,
} = require("./userController");
const { protect } = require("../middleware/authMiddleware");
router.post("/signup", registerUser);
router.post("/verifyOTP", verifyOtp);
router.post("/login", loginUser);
router.post("/resendOtpVerificationCode", resendOtp);
router.post("/sendOtp", sendOtp);
router.get("/user/:userId", getUser);
router.put("/user/:userId", updateUser);
router.delete("/user/:userId", deleteUser);
router.route("/searchuser").get(protect, getAllUsers);
router.post("/get-all-notification", protect, getAllNotification);
router.get("/getallnotifications", getAllNotifications);
router.post("/delete-all-notification", protect, deleteAllNotification);
router.post("/booknowtraveler", protect, bookNowTraveler);
module.exports = router;
