
const passport = require("passport")

require("dotenv").config()


// Google authentication
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
passport.use(new GoogleStrategy({
    clientID:  process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3009/auth/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    // console.log(profile)
   done(null, profile);
  }
));


passport.serializeUser((user,done)=>{
  done(null,user)
})

passport.deserializeUser((user,done)=>{
    done(null,user)
})

//  facbook authentication

const FacebookStrategy = require("passport-facebook").Strategy;



module.exports = {
    GoogleStrategy,
    FacebookStrategy,
}