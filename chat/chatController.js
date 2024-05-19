const asyncHandler = require("express-async-handler");

const getChats = asyncHandler(async(req,res) =>{
    res.json("CHats")
} )

module.exports= {
    getChats
};