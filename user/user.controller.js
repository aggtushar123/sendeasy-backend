const userService = require('./user.service')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const userOtpVerification = require('../models/userOtpVerification')

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

    const userExists = await userService.userExists({email})

    if(userExists){
        if(userExists.verified==true){
            res.status(400)
            throw new Error('User already exists, Please login')
        }else{
            await userService.resendOtp({email})
        }
    }else{
        try {
            const result = await userService.createNewUser({
                fName,
                lName,
                email,
                password
            })
            await userService.sendOTPVerificationEmail(result, res);
            
        } catch (error) {
            return res.status(500).send({ message: 'Error saving user' })
        }
    }

})

const verifyOtp = async(req, res) =>{
        let {userId, otp} = req.body
        if(!userId || !otp){
            throw new ERROR("Empty otp details are not allowed");
        }
        const userOtpVerificationRecords = await userOtpVerification.find({userId});
        if(!userOtpVerificationRecords){
            throw new ERROR("Account record doesn't exist or has been verified already. Please sign up or log in")
        }
        try {
             await userService.userVerifyOtp(userOtpVerificationRecords, otp, userId, res)
        } catch (error) {
            return res.status(500).send({ message: 'Error Verfying Otp' })
        }
}

const resendOtp = async(req,res) => {
    try{
        let {email} = req.body
        if(!email){
            throw new ERROR("Empty details are not allowed");
        }else{
            await userService.resendOtp({email}, res)
        }
    }catch(error){
        res.json({
            status: "Failed",
            message: error.message
        })
    }
}
module.exports = {registerUser,verifyOtp, resendOtp}