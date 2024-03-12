const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    fName: {
        type: String,
        required: [true, 'Please add First Name']
    },
    lName: {
        type: String,
        required: [true, 'Please add Last Name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email']
    },
    password: {
        type: String,
        required: [true, 'Please add a Password']
    },
    verified:{
        type: Boolean,
        required: [true, 'Please verify using OTP'],
        default: false
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    } 

},
{
    timestamps: true,
}
)

module.exports = mongoose.model('User', userSchema)