const express = require('express');
const router = express.Router();
const {getBookingById, acceptBooking} = require('./bookingController');
const { protect } = require("../middleware/authMiddleware");
router.get('/:id', protect, getBookingById);
router.patch('/:id/accept', acceptBooking);

module.exports = router;
