const bookingModel = require('../models/bookingModel');

const getBookingById = () => async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).send({ message: 'Booking not found' });
    }
    res.status(200).send(booking);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const acceptBooking =  () =>async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).send({ message: 'Booking not found' });
    }
    booking.status = 'accepted';
    await booking.save();
    res.status(200).send({ message: 'Booking status updated to accepted' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports ={
    getBookingById,
    acceptBooking
}
