const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const userOtpVerification = require("../models/userOtpVerification");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

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
        const finalUserId = await User.findById(userId)
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
      data: { userId: _id},
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
      status: "success",
      message: "User Email verified successfully",
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
            await User.updateOne({ _id: userId },  {token: generateToken(userId)}, { verified: true });
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
    console.log("user id when getting user api ", userId);

    const user = await User.findById(userId);
    if (user) {
      res.status(200).json({ exists: true, user });
    } else {
      // User does not exist
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    // Handle errors
    console.error('Error checking user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
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

    return res.status(200).json( user );
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
  getUser
};
