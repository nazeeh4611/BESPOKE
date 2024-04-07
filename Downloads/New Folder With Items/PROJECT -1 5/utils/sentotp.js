const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Otp = require("../model/userOtpVerification");

// transporter creating

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email_USERNAME,
    pass: process.env.Email_Password,
  },
});

// send otp to email

const sendOtpVerificationMail = async ({ email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log("Genarated otp", otp);

    // mail options_______

    const mailoption = {
      from: "bespokeshopping07@gmail.com",
      to: email,
      subject: "Welcome, verify your email",
      html: `<P> Enter OTP <b> ${otp}</b> in the above to verify email`,
    };

    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    await Otp.updateOne(
      { email },
      {
        otp: hashedOTP,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60000),
      },
      { upsert: true }
    );

    await transporter.sendMail(mailoption);

    console.log("OTP sent successfully to", email);
    res.redirect(`/otp?email=${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).send("Error sending OTP email. Please try again later.");
  }
};
module.exports = {
  transporter,
  sendOtpVerificationMail,
};
