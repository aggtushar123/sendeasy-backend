const mongoose = require('mongoose')

const travelerListingSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    travelType:{
        type: String,
        required: [true, 'Please select travel type'],
        enum: ['local', 'outstation', 'international']
    },
    destinationLocation: {
        type: String,
        required: [true, 'Please add a location']
    },
    luggageSpace: {
        type: Number,
        required: [true, 'Please add Availaible Luggage Space']
    },
    date:{
        type: Date,
        required: [true, 'Please enter Date of Travel'],
    },
    expectaion: {
        type: Number,
        required: true,
    },
    timeOfDelivery: {
        type: String,
        required: [true, 'Please enter time of delivery'],

    },
    sourceLocation: {
        type: String,
        required: [true, 'Please add a source location']
    }, 
    departure: {
        type: String,
        required: [true, 'Please add time of dept']
    }, 
    items: {
        type: String,
        required: [false, 'Please add items you will not carry']
    }, 
},
{
    timestamps: true,
}
)

module.exports = mongoose.model('TravelerListing', travelerListingSchema)