const User = require('./models/userModel')
const userOtpVerification = require('./model')
const generateOtp = require('../utils/generateOtp')
const sendEmail = require('../utils/sendEmail')
const hashData = require('../utils/hashData')

const userExists = (email) => {
  const user = User.findOne(email)
  return user
}

const sendOTPVerificationEmail = async({_id, email}, res) =>{
        const otp = await generateOtp();
        const mailOptions = {
            from: 'sendalong93@gmail.com',
            to: email,
            subjet: "Verify your Email",
            html: `<p> Enter <b>${otp}</b> in the app to verify your email and complete the signup</p><p>This code <b>expires in 1 hour</b>.</p>`,
        };
        
        const hashedOTP = await hashData(otp)
        const userOtp = new userOtpVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now()+ 3600000,
        })
        await userOtp.save();
        await sendEmail(mailOptions)
}

const createNewUser = async(data) => {
    const hashedPassword = await hashData(data.password)
    const user = await new User({
        fName,
        lName,
        email, 
        password: hashedPassword,
        verified: false,
    });
    const createdUser = await user.save()
    return createdUser    
}
const userVerifyOtp = async(userOtpVerificationRecords, otp, userId, res) => {
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

const resendOtp = async(email, res) => {
    const userData = await userOtpVerification.findOne({email})
    const {userId} = userData
    await userOtpVerification.deleteMany({userId});
    sendOTPVerificationEmail({_id: userId, email}, res);
}

module.exports = {resendOtp, userExists, createNewUser, sendOTPVerificationEmail, userVerifyOtp}