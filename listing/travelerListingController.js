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
    res.status(500).json({ message: "Server Error" });
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
 
 
  const travelerListing = await TravelerListing.findById(req.params.id);
  if (!travelerListing) {
    res.status(404);
    throw new Error("Traveler Listing not Found");
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
    expectation,
    timeOfDelivery,
    sourceLocation,
    departure,
    type,
  } = req.body;
  if (
    !travelType ||
    !destinationLocation ||
    !luggageSpace ||
    !date ||
    !expectation ||
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
    expectation,
    timeOfDelivery,
    sourceLocation,
    departure,
    type,
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

const updateTravelerTripsStatus = asyncHandler(async (req, res) => {
  const { trips } = req.body;

  if (!trips) {
    return res.status(400).json({ message: "Please provide trips status" });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const travelerListing = await TravelerListing.findById(req.params.id);
  if (!travelerListing) {
    return res.status(404).json({ message: "Traveler Listing not Found" });
  }

  if (travelerListing.user.toString() !== req.user.id) {
    return res.status(401).json({ message: "Not Authorized" });
  }

  travelerListing.trips = trips;
  await travelerListing.save();

  res.status(200).json(travelerListing);
});

module.exports = {
  getAllTravelerListings,
  getTravelerListings,
  getTravelerListing,
  createTravelerListing,
  updateTravelerListing,
  deleteTravelerListing,
  updateTravelerTripsStatus,
};
