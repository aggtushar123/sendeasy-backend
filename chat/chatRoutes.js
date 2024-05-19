const express = require('express')
const router = express.Router()
const {getChats} = require('./chatController')

router.route('/').get(getChats)

module.exports = router;