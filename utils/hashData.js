const bcrypt = require('bcrypt')

const hashData = async (data) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedData = await bcrypt.hash(data, salt)
        return hashedData
    } catch (error) {
        throw error
    }
}

module.exports = hashData;