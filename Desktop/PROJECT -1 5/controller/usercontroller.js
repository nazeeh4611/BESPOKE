const User = require("../model/userModel");
const bcrypt = require("bcrypt");
require("dotenv").config();
const randomstrings = require("randomstring");
const { sendOtpVerificationMail } = require("../utils/sentotp");
const userOtpVerification = require("../model/userOtpVerification");

//  homepage

const loadHome = async (req, res) => {
  try {
    const userIn = req.session.userId;

    res.render("user/home", { userIn });
  } catch (error) {
    console.log(error.message);
  }
};

// user register

const userRegister = async (req, res) => {
  try {
    res.render("user/register");
  } catch (error) {
    console.log(error.message);
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//  verify registration

const verifyRegister = async (req, res) => {
  try {
    const existUser = await User.findOne({ email: req.body.email });
    if (existUser && !existUser.is_Verified) {
      const message = "Email already Registered ";
      res.render("user/register", { message });
    } else if (existUser && !existUser.is_Verified) {
      const message =
        "Email already registered but not not verified. send OTP to email and verify the Email ";
      res.render("user/register", { message });
    } else {
      const confirmPassword = req.body.confirmPassword;
      console.log(confirmPassword);
      const spassword = await securePassword(req.body.password);
      console.log("the spassword", spassword);

      const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: spassword,
        confirmpassword: confirmPassword,
      });

      if (req.body.password !== confirmPassword) {
        return res.render("user/register", {
          message: "password do not match",
        });
      }

      const userdata = await user.save();
      req.session.email = req.body.email;
      await sendOtpVerificationMail(userdata, res);
    }
  } catch (error) {
    console.log(error.message);
  }
};

// import from utils

const getsendOtp = async (req, res) => {
  try {
    await sendOtpVerificationMail({ email: req.session.email }, res);
  } catch (error) {
    console.log(error.message);
  }
};

// load otp_____

const loadotp = async (req, res) => {
  try {
    const email = req.query.email;
    res.render("user/verifyotp", { email: email });
  } catch (error) {
    console.log("error in loading OTP page:", error.message);
  }
};

// verify otp__________

const verifyotp = async (req, res) => {
  try {
    console.log("hii", req.body);
    const email = req.body.email;
    const enteredOTP =
      req.body.one + req.body.two + req.body.three + req.body.four;
    const userOtpRecord = await userOtpVerification.findOne({ email: email });

    if (!userOtpRecord) {
      return res.render("user/verifyotp", { message: `OTP not found`, email });
    }

    const expiresAt = userOtpRecord.expiresAt;

    if (expiresAt < Date.now()) {
      return res.render("user/verifyotp", { message: "OTP expired", email });
    }

    const { otp: hashedOTP } = userOtpRecord;
    const validOTP = await bcrypt.compare(enteredOTP, hashedOTP);
    console.log(validOTP);
    if (validOTP) {
      const userData = await User.findOne({ email: email });

      if (!userData) {
        return res
          .status(400)
          .json({ success: false, message: "User not found" });
      }

      await User.findByIdAndUpdate(
        { _id: userData._id },
        { is_Verified: true }
      );
      req.session.userId = userData._id;

      await userOtpVerification.deleteOne({ email: email });

      console.log("hell");

      res.json({ success: true });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.log("Error in verifyotp:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const resentOtp = async (req, res) => {
  try {
    console.log(req.body);
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    await sendOtpVerificationMail(userData, res);
    return res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

// user login page--------------

const userLogin = async (req, res) => {
  try {
    res.render("user/login");
  } catch (error) {
    console.log(error.message);
  }
};

// verify login-----------

const verifylogin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    console.log("usr data nguy", user);

    if (user) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );
      console.log("hiii");
      if (passwordMatch) {
        if (user.is_Verified === 1) {
          req.session.userId = user._id;
          console.log(req.session.userId);
          return res.redirect("/");
        } else {
          await user.deleteOne({ is_Verified: 0 });
          const message = "user is not virified please verify your email";
          return res.render("user/login", { message });
        }
      } else {
        const message = "The password you entered is incorrect";
        return res.render("user/login", { message });
      }
    } else {
      const message = "please register your email";
      return res.render("user/login", { message });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).end("Internal server error");
  }
};

//  home page after login

const afterlogin = async (req, res) => {
  try {
    res.render("user/home");
  } catch (error) {
    console.log(error.message);
  }
};

// forget password

const lostpassword = async (req, res) => {
  try {
    res.render("user/forgetpassword");
  } catch (error) {
    console.log(error.message);
  }
};

// lost password verify

const lostpasswordVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const Details = await User.findOne({ email: email });
    if (Details) {
      if (Details.is_Verified == 0) {
        res.render("user/forgetpassword", {
          message: "please verify your email",
        });
      } else {
        const randomstring = randomstrings.generate();
        const updatedetail = await User.updateOne(
          { email: email },
          { $set: { token: randomstring } }
        );
        sendforgetemail(Details.name, Details.email, randomstring);
        res.render("user/forgetpassword", {
          message: "please check your email",
        });
      }
    } else {
      res.render("user/forgetpassword", { message: "Email is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const MyAccount = async (req, res) => {
  try {
    res.render("user/profile");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadHome,
  userRegister,
  loadotp,
  securePassword,
  verifyRegister,
  loadotp,
  getsendOtp,
  resentOtp,
  verifyotp,
  userLogin,
  verifylogin,
  afterlogin,
  lostpassword,
  lostpasswordVerify,
  MyAccount,
};
