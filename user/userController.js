const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const userOtpVerification = require("../models/userOtpVerification");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const Booking = require('../models/bookingModel')
const TravelerListing = require("../models/travelerListing");

let mainUserId;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    type: "OAuth2",
    user: "sendalong93@gmail.com",
    clientId: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    refreshToken: process.env.AUTH_REFRESH_TOKEN,
  },
});

//Register a New User
// /api/users/signup
// public
const registerUser = asyncHandler(async (req, res) => {
  const { fName, email, password, cPassword } = req.body;

  if (!fName || !email || !password || !cPassword) {
    res.status(400);
    throw new Error("Please include all fields");
  }

  if (!/^[a-zA-z ]*$/.test(fName)) {
    res.status(400);
    throw new Error("Invalid First Name entered");
  }

  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.status(400);
    throw new Error("Invalid email entered");
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error("Password is too short!");
  }

  if (cPassword !== password) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = new User({
    fName,
    email,
    password: hashedPassword,
    verified: false,
  });
  //   const userData = await userOtpVerifiation.findOne({ email });
  //   const { userId } = userData;
  try {
    const result = await sendOTPVerificationEmail(user, res);
    const userId = mainUserId.toString();

    setTimeout(async () => {
      const finalUserId = await User.findById(userId);
      // console.log(finalUserId);
      if (finalUserId.verified === false) {
        console.log("Deleting");
        await User.findByIdAndDelete(userId);
      }
    }, 25000);
    console.log("Inside register check");
    console.log(result.statusCode);
    if (result.statusCode === 200) {
      console.log("OTP Sent");
      const savedUser = await user.save();
    }
  } catch (error) {
    res.status(500).send({ message: "Error registering user", error });
  }
});

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
      from: "sendalong93@gmail.com",
      to: email,
      subject: "Verify your Email",
      html: `<p> Enter <b>${otp}</b> in the app to verify your email and complete the signup</p><p>This code <b>expires in 1 hour</b>.</p>`,
    };
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp, salt);

    const userOtp = new userOtpVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    await userOtp.save();
    await transporter.sendMail(mailOptions);
    mainUserId = _id;

    return res.json({
      status: "success",
      message: "verification otp email sent",
      data: { userId: _id },
    });
  } catch (error) {
    res.json({
      status: "failed",
      message: error.message,
    });
  }
};

const sendOtp = async (req, res) => {
  const otp = Object.keys(req.body)[0];
  const userId = mainUserId;

  if (!otp) {
    throw new ERROR("Empty otp details are not allowed");
  }

  const verifyResult = await verifyOtp({ otp, userId });
  if (verifyResult.status === "Verified") {
    // clearTimeout(verifyTimeout);
    const savedUser = await User.findByIdAndUpdate(
      userId,

      { verified: true },
      { new: true }
    );
    return res.json({
      user: savedUser,
    });
  } else {
    return res.status(400).json({
      status: "failed",
      message: "Email verification failed",
    });
  }
};
const verifyOtp = async ({ userId, otp }, req, res) => {
  try {
    if (!userId || !otp) {
      throw new ERROR("Empty otp details are not allowed");
      return;
    } else {
      const userOtpVerificationRecords = await userOtpVerification.find({
        userId,
      });
      if (!userOtpVerificationRecords) {
        throw new ERROR(
          "Account record doesn't exist or has been verified already. Please sign up or log in"
        );
        return;
      } else {
        const { expiresAt } = userOtpVerificationRecords[0];
        const hashedOTP = userOtpVerificationRecords[0].otp;

        if (expiresAt < Date.now()) {
          await userOtpVerification.deleteMany({ userId });
          throw new Error("Code has expired. Please request again.");
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);

          if (!validOTP) {
            //   throw new Error("Invalid code Passed. Check your inbox.");
            return {
              status: "Invalid",
              message: "Invalid code Passed. Check your inbox.",
            };
          } else {
            console.log("IN THE FINAL ELSE");
            await User.updateOne(
              { _id: userId },
              { token: generateToken(userId) },
              { verified: true }
            );
            await userOtpVerification.deleteMany({ userId });
            return {
              status: "Verified",
              message: "User Email verified successfully",
            };
          }
        }
      }
    }
  } catch (error) {
    return res.json({
      status: "Failed",
      message: error.message,
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      throw new ERROR("Empty details are not allowed");
    } else {
      const userData = await userOtpVerification.findOne({ email });
      const { userId } = userData;
      await userOtpVerification.deleteMany({ userId });
      sendOTPVerificationEmail({ _id: userId, email }, res);
    }
  } catch (error) {
    res.json({
      status: "Failed",
      message: error.message,
    });
  }
};
const getUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (user) {
      res.status(200).json( user );
    } else {
      // User does not exist
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    // Handle errors
    console.error("Error checking user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getAllUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

  
const updateUser = async (req, res) => {
  const userId = req.params.userId;
  const updates = req.body;
  const token = req.body.token;

  try {
    const user = await User.findByIdAndUpdate(userId, updates);
    if (token) {
      user.token = token;
      await user.save();
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};


const loginUser = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  if (email == "" || password == "") {
    res.status(401);
    throw new Error("Empty Input Fields");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error("Email not registered");
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user.id,
      fName: user.fName,
      email: user.email,
      token: user.token,
      verified: user.verified,
      mobile: user.mobile,
      kycDocument: user.kycDocument,
      description: user.description,
      dob: user.dob,
      gender: user.gender,
      occupation: user.occupation,
      workplace: user.workplace,
      workplaceEmail: user.workplaceEmail,
      address: user.address,
      linkedin: user.linkedin,
      facebook: user.facebook,
      instagram: user.instagram,
    });
  } else {
    res.status(401);
    throw new Error("Invalid Password");
  }
});


const deleteUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const { userId } = req.query; 
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'UserId is required' });
    }
    
    const user = await User.findOne({ _id: userId });
    console.log(user)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json(
      user.notification, // Assuming 'notification' should be 'notifications'
);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};


const getAllNotification = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notification = user.notification;
    seennotification.push(...notification);
    user.notification = [];
    user.seennotification = notification;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "all notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};
const deleteAllNotification = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable to delete all notifications",
      error,
    });
  }
};
const bookNowTraveler = async (req, res) => {
  try {
    // Extract data from the request body
    const { userId, listedId, listingInfo, userInfo } = req.body;

    // Create a new booking with pending status
    const newBooking = new Booking({
      userId,
      listedId,
      listingInfo,
      userInfo,
      status: "pending" // Assuming your Booking model has a 'status' field
    });

    // Save the new booking to the database
    await newBooking.save();

    // Find the user associated with the listedId
    const user = await User.findOne({ _id: listedId });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Add a notification to the user
    if (!user.notification) {
      user.notification = [];
    }

    user.notification.push({
      from: userInfo.fName,
      message: `New Booking Request from ${userInfo.fName} `,
      bookingId: newBooking._id
    });

    // Save the updated user object
    const updatedUser = await user.save();

    // Send success response
    res.status(200).json({
      success: true,
      message: "Appointment Booked successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error While Booking Appointment",
    });
  }
};


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  sendOtp,
  updateUser,
  getUser,
  deleteUser,
  getAllUsers,
  getAllNotification,
  deleteAllNotification,
  bookNowTraveler,
  getAllNotifications,
};
