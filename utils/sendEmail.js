const nodemailer = require('nodemailer')


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
      type:"OAuth2",
      user: 'sendalong93@gmail.com',
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
      refreshToken: process.env.AUTH_REFRESH_TOKEN, 
    },
  });

  const sendEmail = async(mailOptions) => {
    try {
        const emailSent = await transporter.sendMail(mailOptions);
        return emailSent;
    } catch (error) {
        throw error
    }
  }

  module.exports = sendEmail