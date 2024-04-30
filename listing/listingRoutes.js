const express = require('express')
const router = express.Router()
const {getTravelerListings, createTravelerListing, getTravelerListing, deleteTravelerListing, updateTravelerListing} = require('./travelerListingController')
const {getLuggageListings, createLuggageListing, getLuggageListing, deleteLuggageListing, updateLuggageListing} = require('./luggageListingController')
const {protect} = require('../middleware/authMiddleware')

router.route('/travelerlisting').get(protect, getTravelerListings).post(protect, createTravelerListing)
router.route('/travelerlisting/:id').get(protect, getTravelerListing).delete(protect, deleteTravelerListing).put(protect, updateTravelerListing)
router.route('/luggagelisting').get(protect, getLuggageListings).post(protect, createLuggageListing)
router.route('/luggagelisting/:id').get(protect, getLuggageListing).delete(protect, deleteLuggageListing).put(protect, updateLuggageListing)
module.exports = router