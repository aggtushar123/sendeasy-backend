const mongoose = require('mongoose')

const luggageListingSchema = mongoose.Schema({
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
    numberOfBags: {
        type: Number,
        required: [true, 'Please add Availaible Luggage Space']
    },
    sourceLocation: {
        type: String,
        required: [true, 'Please add a source location']
    },    
    totalWeight: {
        type: Number,
        required: true,
    },
    dateRange:{
        type: Date,
        required: [true, 'Please enter Date of Travel'],
    },   
    typeOfItems: {
        type: String,  
    }, 
    nameOfItems: {
        type: String,
        required: [true, 'Please add name of items']
    }, 
    receiverName: {
        type: String,
        required: [true, 'Please add name of Reciever']
    }, 
    receiverNumber: {
        type: String,
        required: [true, 'Please add number of Receiver']
    }, 
    receiverLocation: {
        type: String,
        required: [true, 'Please add Location']
    }, 
   M: {
        type: String,
       
    }, 
},
{
    timestamps: true,
}
)

module.exports = mongoose.model('LuggageListing', luggageListingSchema)