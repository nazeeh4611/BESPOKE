const passport = require("passport");
require("dotenv").config();
const User = require("../model/userModel");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const bcrypt = require("bcrypt");
const { Long } = require("mongodb");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3009/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
const success = async (req, res) => {
  try {
    // Checking if the email already exists in the database
    const existUser = await User.findOne({ email: req.user.email });
   

    if (existUser) {
      req.session.userId = existUser._id;
      return res.redirect("/");
    } else {
      // Hashing the user's Google ID for password
      const spassword = await securePassword(req.user.id);
      console.log("spass", spassword);

      // Creating a new instance of the User model
      const newUser = new User({
        name: req.user.displayName,
        email: req.user.email,
        mobile: 0,
        password: spassword,
        confirmpassword: 0,
        is_Verified: 1,
        is_Admin: 0,
        is_Blocked: 0,
        google: true,
      });

      // Saving the new user to the database
      const saveUser = await newUser.save();

      if (saveUser) {
        req.session.userId = saveUser._id;
      }
      return res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//facebook

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3009/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"],
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

const successfb = async (req, res) => {
  try {
    // Checking if the email already exists in the database
    const existUser = await User.findOne({ email: req.user.email });

    if (existUser) {
      req.session.userId = existUser._id;
      return res.redirect("/");
    } else {
      // Hashing the user's Google ID for password
      const spassword = await securePassword(req.user.id);
      console.log("spass", spassword);

      // Creating a new instance of the User model
      const newUser = new User({
        name: req.user.displayName,
        email: req.user.email,
        mobile: 0,
        password: spassword,
        confirmpassword: 0,
        is_Verified: 1,
        is_Admin: 0,
        is_Blocked: 0,
        facebook: true,
      });

      // Saving the new user to the database
      const saveUser = await newUser.save();

      if (saveUser) {
        req.session.userId = saveUser._id;
      }
      return res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// passport.serializeUser((user,done)=>{
//     done(null,user)
//   })

//   passport.deserializeUser((user,done)=>{
//       done(null,user)
//   })

module.exports = {
  success,
  successfb,
};
