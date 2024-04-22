const express = require('express')
const router = express.Router()
const {registerUser, loginUser, verifyOtp, resendOtp, sendOtp} = require('./userController')

router.post('/signup', registerUser)
router.post('/verifyOTP', verifyOtp)
router.post('/login', loginUser)
router.post('/resendOtpVerificationCode', resendOtp)
router.post('/sendOtp', sendOtp)
// router.get('/me', getMe)

module.exports = router