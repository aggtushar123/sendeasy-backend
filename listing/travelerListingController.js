const asyncHandler = require("express-async-handler")
const User = require('../models/userModel')
const TravelerListing = require('../models/travelerListing')

// Get TravelerListing
// Get /api/travelerListing
// @access PRIVATE
const getTravelerListing = asyncHandler(async(req,res) => {

    const user = await User.findById(req.user.id)
    if(!user){
        res.status(401)
        throw new Error('User not found')
    }
    const travelerListing = await TravelerListing.find({user : req.user.id})

    res.status(200).json(travelerListing)
})

// Create Traveler Listing 
// POST /api/travelerlisting
const createTravelerListing = asyncHandler(async(req,res) => {
    const {travelType, destinationLocation, luggageSpace, date, expectaion, timeOfDelivery, sourceLocation,  departure } = req.body 
    if(!travelType || !destinationLocation || !luggageSpace || !date || !expectaion || !timeOfDelivery || !sourceLocation || !departure ){
        res.status(400)
        throw new Error('Please add a ')
    }
    const user = await User.findById(req.user.id)
    if(!user){
        res.status(401)
        throw new Error('User not found')
    }
  

    const travelerListing = await TravelerListing.create({
        travelType, destinationLocation, luggageSpace, date, expectaion, timeOfDelivery, sourceLocation,  departure,
        user: req.user.id,
    })

    res.status(201).json(travelerListing)
})

module.exports ={
    getTravelerListing,
    createTravelerListing,
}