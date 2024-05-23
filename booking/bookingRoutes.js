const express = require('express');
const router = express.Router();
const {getBookingById, acceptBooking} = require('./bookingController');

router.get('/:id', getBookingById);
router.patch('/:id/accept', acceptBooking);

module.exports = router;
