const express = require('express')
const router = express.Router()
const {getTravelerListing, createTravelerListing} = require('./travelerListingController')
const {protect} = require('../middleware/authMiddleware')

router.route('/travelerlisting').get(protect, getTravelerListing).post(protect, createTravelerListing)

module.exports = router