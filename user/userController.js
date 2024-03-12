const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const userOtpVerification = require('../models/userOtpVerification')
const nodemailer = require('nodemailer')


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
      type:"OAuth2",
      user: 'sendalong93@gmail.com',
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
      refreshToken: process.env.AUTH_REFRESH_TOKEN, 
    },
  });


//Register a New User
// /api/users/signup
// public
const registerUser = asyncHandler(async(req,res) => {
    const { fName, lName, email, password, cPassword } = req.body;

    if (!fName || !lName || !email || !password || !cPassword) {
        res.status(400)
        throw new Error('Please include all fields');
    } 
        
    if (!/^[a-zA-z ]*$/.test(fName)) {
        res.status(400)
        throw new Error('Invalid First Name entered');
    }  
    
    if (!/^[a-zA-z ]*$/.test(lName)) {
        res.status(400)
        throw new Error('Invalid Last Name entered');
    }  
    
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.status(400)
        throw new Error('Invalid email entered');
    } 
    
    if (password.length < 8) {
        res.status(400)
        throw new Error('Password is too short!');
    } 
    
    if (cPassword !== password) {
        res.status(400)
        throw new Error('Passwords do not match');
    }

        const userExists = await User.findOne({email})
        if(userExists){
                res.status(400)
                throw new Error('User already exists')
            }else{
                const salt = await bcrypt.genSalt(10)
                const hashedPassword = await bcrypt.hash(password, salt)
                const user = await new User({
                    fName,
                    lName,
                    email, 
                    password: hashedPassword,
                    verified: false,
                });
                try {
                    const result = await user.save()
                    sendOTPVerificationEmail(result, res);
                } catch (error) {
                    return res.status(500).send({ message: 'Error saving user' })
                }     
            }
    }
)
    const sendOTPVerificationEmail = async({_id, email}, res) =>{
        try{
            const otp = `${Math.floor(1000 + Math.random()* 9000)}`;
            const mailOptions = {
                from: 'sendalong93@gmail.com',
                to: email,
                subjet: "Verify your Email",
                html: `<p> Enter <b>${otp}</b> in the app to verify your email and complete the signup</p><p>This code <b>expires in 1 hour</b>.</p>`,
            };
            const salt = await bcrypt.genSalt(10)
            const hashedOTP = await bcrypt.hash(otp, salt)

            const userOtp = new userOtpVerification({
                userId: _id,
                otp: hashedOTP,
                createdAt: Date.now(),
                expiresAt: Date.now()+ 3600000,
            })
            userOtp.save();
            await transporter.sendMail(mailOptions)
            res.json({
                status: "PENDING",
                message: "Verfication otp email sent",
                date: {
                    userId: _id,
                    email,
                },
            });
        } catch (error){
            res.json({
                status: "Failed",
                message: error.message,
            })
        }

    }

const verifyOtp = async(req, res) =>{
    try{
        let {userId, otp} = req.body
        if(!userId || !otp){
            throw new ERROR("Empty otp details are not allowed");
        }else{
            const userOtpVerificationRecords = await userOtpVerification.find({userId});
            if(!userOtpVerificationRecords){
                throw new ERROR("Account record doesn't exist or has been verified already. Please sign up or log in")
            }else{

                const {expiresAt} = userOtpVerificationRecords[0];
                const hashedOTP = userOtpVerificationRecords[0].otp;

                if(expiresAt < Date.now()){
                    await userOtpVerification.deleteMany({ userId })
                    throw new Error("Code has expired. Please request again.")
                }else {
                    const validOTP = await bcrypt.compare(otp, hashedOTP)
                    if(!validOTP){
                        throw new Error("Invalid code Passed. Check your inbox.")
                    }else{
                        await User.updateOne({_id:userId}, {verified: true})
                        await userOtpVerification.deleteMany({userId});
                        res.json({
                            status: "Verified",
                            message: "User Email verified successfully"
                        })
                    }
                }
            }
        }

    }catch(error){
        res.json({
            status: "Failed",
            message: error.message
        })
    }
}

const resendOtp = async(req,res) => {
    try{
        let {email} = req.body
        if(!email){
            throw new ERROR("Empty details are not allowed");
        }else{
            const userData = await userOtpVerification.findOne({email})
            const {userId} = userData
            await userOtpVerification.deleteMany({userId});
            sendOTPVerificationEmail({_id: userId, email}, res);
        }
    }catch(error){
        res.json({
            status: "Failed",
            message: error.message
        })
    }
}

const loginUser = asyncHandler(async(req, res) =>{ 

    let {email, password} = req.body;

    if(email == "" || password == ""){
        res.status(401)
        throw new Error('Empty Input Fields')
    }
    
    const user = await User.findOne({email})
    if(!user){
        res.status(401)
        throw new Error('Email not registered')
    }

    if(user && (await bcrypt.compare(password, user.password))){
        res.status(200).json({
            _id: user.id,
            fName: user.fName,
            lName: user.lName,
            email: user.email,
        })
    }else{
        res.status(401)
        throw new Error('Invalid Password')
    }
})

module.exports = { 
    registerUser,
    loginUser,
    verifyOtp,
    resendOtp
}