const express = require('express')
const router = express.Router()
const {getAllTravelerListings, getTravelerListings, createTravelerListing, getTravelerListing, deleteTravelerListing, updateTravelerListing, updateTravelerTripsStatus} = require('./travelerListingController')
const {getAllLuggageListings, getLuggageListings, createLuggageListing, getLuggageListing, deleteLuggageListing, updateLuggageListing, updateLuggageTripsStatus} = require('./luggageListingController')
const {protect} = require('../middleware/authMiddleware')

router.route('/travelerlisting').get(protect, getTravelerListings).post(protect, createTravelerListing)
router.route('/travelerlisting/getall').get(getAllTravelerListings)
router.route('/travelerlisting/:id').get(protect, getTravelerListing).delete(protect, deleteTravelerListing).put(protect, updateTravelerListing)
router.put('/travelerlisting/:id/updatetripstatus', protect, updateTravelerTripsStatus);

router.route('/luggagelisting').get(protect, getLuggageListings).post(protect, createLuggageListing)
router.route('/luggagelisting/getall').get(getAllLuggageListings)
router.route('/luggagelisting/:id').get(protect, getLuggageListing).delete(protect, deleteLuggageListing).put(protect, updateLuggageListing)
router.put('/luggagelisting/:id/updatetrips', protect, updateLuggageTripsStatus);
module.exports = router