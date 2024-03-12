const mongoose = require('mongoose')

const userOtpVerificationSchema = mongoose.Schema({
    userId:{
        type: String,
    },
    otp:{
        type: String,
    },
    createdAt: {
        type: Date,
    },
    expiresAt:{
        type: Date,
    }
})

module.exports = mongoose.model('userOtpVerification', userOtpVerificationSchema);