const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const LuggageListing = require("../models/luggageListing");
const cloudinary = require("../utils/cloudinary");
// Get TravelerListings
// Get /api/travelerListing
// @access PRIVATE

const getAllLuggageListings = asyncHandler(async (req, res) => {
  try {
    const data = await LuggageListing.find();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

const getLuggageListings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }
  const luggageListings = await LuggageListing.find({ user: req.user.id });

  res.status(200).json(luggageListings);
});

// Get Single TravelerListing
// Get /api/travelerListing/:id
// @access PRIVATE
const getLuggageListing = asyncHandler(async (req, res) => {
  const luggageListing = await LuggageListing.findById(req.params.id);
  if (!luggageListing) {
    res.status(404);
    throw new Error("Luggage Listing not Found");
  }

  res.status(200).json(luggageListing);
});

// Create Traveler Listing
// POST /api/travelerlisting
const createLuggageListing = asyncHandler(async (req, res) => {
  const {
    travelType,
    destinationLocation,
    numberOfBags,
    sourceLocation,
    totalWeight,
    dateRange,
    typeOfItems,
    nameOfItems,
    receiverName,
    receiverNumber,
    receiverLocation,
    note,
    type,
    image,
    image2,
    expectation,
  } = req.body;

  if (
    !travelType ||
    !destinationLocation ||
    !numberOfBags ||
    !sourceLocation ||
    !totalWeight ||
    !dateRange ||
    !typeOfItems ||
    !nameOfItems ||
    !receiverName ||
    !receiverNumber ||
    !receiverLocation ||
    !image ||
    !image2 ||
    !expectation
  ) {
    res.status(400);
    throw new Error("Please add details");
  }
  const uploadedImage1 = await cloudinary.uploader.upload(
    image,
    {
      upload_preset: "us4q4ppn",
      public_id: "avatar",
      allowed_formats: ["png", "jpg", "jpeg", "svg", "ico", "jfif", "webp"],
    },
    function (error, result) {
      if (error) {
        console.log(error);
      }
 
    }
  );
  const uploadedImage2 = await cloudinary.uploader.upload(
    image2,
    {
      upload_preset: "us4q4ppn",
      public_id: "avatar",
      allowed_formats: ["png", "jpg", "jpeg", "svg", "ico", "jfif", "webp"],
    },
    function (error, result) {
      if (error) {
        console.log(error);
      }
      
    }
  );

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const luggageListing = await LuggageListing.create({
    travelType,
    destinationLocation,
    numberOfBags,
    sourceLocation,
    totalWeight,
    dateRange,
    typeOfItems,
    nameOfItems,
    receiverName,
    receiverNumber,
    receiverLocation,
    note,
    type,
    image1: uploadedImage1.secure_url,
    image2: uploadedImage2.secure_url,
    expectation,
    user: req.user.id,
  });

  res.status(201).json(luggageListing);
});

// Delete Single TravelerListing
// DELETE /api/travelerListing/:id
// @access PRIVATE
const deleteLuggageListing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }
  const luggageListing = await LuggageListing.find(req.params.id);
  if (!luggageListing) {
    res.status(404);
    throw new Error("Luggage Listing not Found");
  }
  if (luggageListing.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not Authorized");
  }
  await luggageListing.remove();
  res.status(200).json({ success: true });
});

// Update Single TravelerListing
// PUT /api/travelerListing/:id
// @access PRIVATE
const updateLuggageListing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }
  const luggageListing = await LuggageListing.find(req.params.id);
  if (!luggageListing) {
    res.status(404);
    throw new Error("Luggage Listing not Found");
  }
  if (luggageListing.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not Authorized");
  }

  const updatedLuggageListing = await LuggageListing.findByIdAndUpdate(
    req.params.id,
    req.body
  );
  res.status(200).json(updatedLuggageListing);
});

const updateLuggageTripsStatus = asyncHandler(async (req, res) => {
  const { trips } = req.body;
  console.log(trips);
  if (!trips) {
    return res.status(400).json({ message: "Please provide trips status" });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const luggageListing = await LuggageListing.findById(req.params.id);
  if (!luggageListing) {
    return res.status(404).json({ message: "luggage Listing not Found" });
  }

  if (luggageListing.user.toString() !== req.user.id) {
    return res.status(401).json({ message: "Not Authorized" });
  }

  luggageListing.trips = trips;
  await luggageListing.save();

  res.status(200).json(luggageListing);
});

module.exports = {
  getAllLuggageListings,
  getLuggageListings,
  getLuggageListing,
  createLuggageListing,
  updateLuggageListing,
  deleteLuggageListing,
  updateLuggageTripsStatus,
};
