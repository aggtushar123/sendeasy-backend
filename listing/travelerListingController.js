const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const TravelerListing = require("../models/travelerListing");

// Get TravelerListings
// Get /api/travelerListing
// @access PRIVATE
const getAllTravelerListings = asyncHandler(async (req, res) => {
    try {
        const data = await TravelerListing.find();
        res.json(data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
      }
  });

const getTravelerListings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }
  const travelerListings = await TravelerListing.find({ user: req.user.id });

  res.status(200).json(travelerListings);
});

// Get Single TravelerListing
// Get /api/travelerListing/:id
// @access PRIVATE
const getTravelerListing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }
  const travelerListing = await TravelerListing.find(req.params.id);
  if (!travelerListing) {
    res.status(404);
    throw new Error("Traveler Listing not Found");
  }
  if (travelerListing.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not Authorized");
  }
  res.status(200).json(travelerListing);
});

// Create Traveler Listing
// POST /api/travelerlisting
const createTravelerListing = asyncHandler(async (req, res) => {
  const {
    travelType,
    destinationLocation,
    luggageSpace,
    date,
    expectaion,
    timeOfDelivery,
    sourceLocation,
    departure,
  } = req.body;
  if (
    !travelType ||
    !destinationLocation ||
    !luggageSpace ||
    !date ||
    !expectaion ||
    !timeOfDelivery ||
    !sourceLocation ||
    !departure
  ) {
    res.status(400);
    throw new Error("Please add a ");
  }
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const travelerListing = await TravelerListing.create({
    travelType,
    destinationLocation,
    luggageSpace,
    date,
    expectaion,
    timeOfDelivery,
    sourceLocation,
    departure,
    user: req.user.id,
  });

  res.status(201).json(travelerListing);
});

// Delete Single TravelerListing
// DELETE /api/travelerListing/:id
// @access PRIVATE
const deleteTravelerListing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }
  const travelerListing = await TravelerListing.find(req.params.id);
  if (!travelerListing) {
    res.status(404);
    throw new Error("Traveler Listing not Found");
  }
  if (travelerListing.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not Authorized");
  }
  await travelerListing.remove();
  res.status(200).json({ success: true });
});

// Update Single TravelerListing
// PUT /api/travelerListing/:id
// @access PRIVATE
const updateTravelerListing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }
  const travelerListing = await TravelerListing.find(req.params.id);
  if (!travelerListing) {
    res.status(404);
    throw new Error("Traveler Listing not Found");
  }
  if (travelerListing.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not Authorized");
  }

  const updatedTravelerListing = await TravelerListing.findByIdAndUpdate(
    req.params.id,
    req.body
  );
  res.status(200).json(updatedTravelerListing);
});

module.exports = {
    getAllTravelerListings,
  getTravelerListings,
  getTravelerListing,
  createTravelerListing,
  updateTravelerListing,
  deleteTravelerListing,
};
