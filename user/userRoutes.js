const express = require('express')
const router = express.Router()
const {registerUser, loginUser, verifyOtp, resendOtp} = require('./userController')

router.post('/signup', registerUser)
router.post('/verifyOTP', verifyOtp)
router.post('/login', loginUser)
router.post('/resendOtpVerificationCode', resendOtp)

module.exports = router