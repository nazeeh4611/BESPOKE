const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const userRoute = express.Router(); //
const userController = require("../controller/usercontroller");
const cartcontroller = require("../controller/cartcontroller");
const authController = require("../controller/authController");
const addresscontroller = require('../controller/addresscontroller')
const userAuth = require("../middlewares/userAuth");
const session = require("express-session");
// Middleware
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));
userRoute.use(bodyParser.urlencoded({ extended: true }));

userRoute.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: false,
  })
);

// Define routes

// load homepage
userRoute.get("/", userController.loadHome);

// load and verify register
userRoute.get("/register", userAuth.isLogout, userController.userRegister);
userRoute.post("/register", userController.verifyRegister);

// load and verify OTP and resend OTP
userRoute.get("/otp", userAuth.isLogout, userController.loadotp);
userRoute.get("/sendotp", userController.getsendOtp);
userRoute.post("/otp", userController.verifyotp);
userRoute.post("/resend-otp", userController.resentOtp);

// signup and login with google

userRoute.use(passport.initialize());
userRoute.use(passport.session());

userRoute.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

userRoute.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/failure",
  })
);

userRoute.get("/auth/google/success", authController.success);
userRoute.get("/auth/google/failure", (req, res) => {
  res.send("something went wrong");
});

// signup and login with facebook

userRoute.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: "profile" })
);

userRoute.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/auth/facebook/success",
    failureRedirect: "/auth/facebook/failure",
  })
);

userRoute.get("/auth/facebook/success", authController.successfb);
userRoute.get("/auth/facebook/failure", (req, res) => {
  res.send("something went wrong");
});

// load and verify login page
userRoute.get("/login", userAuth.isLogout, userController.userLogin);
userRoute.post("/login", userController.verifylogin);

//  load and verify forget password
userRoute.get("/forgetpass", userController.lostpassword);
userRoute.post("/forgetpass", userController.lostpasswordVerify);

// reset password after veify forget password
userRoute.get("/resetpass", userAuth.isLogout, userController.newPasswordLoad);
userRoute.post("/resetpass", userController.resetPass);

// load shop
userRoute.get("/shop", userController.loadshop);

// load productDetail
userRoute.get("/productdetail", userController.ProductDetail);

// load My Account
userRoute.get("/dashboard", userAuth.isLogin, userController.MyAccount);

//  cart
userRoute.get("/cart", cartcontroller.cartopen);
userRoute.post("/cart", cartcontroller.AddToCart);
userRoute.post("/updatecart", cartcontroller.updateCart);
userRoute.delete("/removecart", cartcontroller.removecart);
module.exports = userRoute;

// load address & add address

userRoute.get('/address',addresscontroller.addresses);
userRoute.get('/addaddress',addresscontroller.NewAddress);
userRoute.post('/addaddress',addresscontroller.postAddress);


// load checkout page and address

userRoute.get('/checkout',cartcontroller.Loadcheckout)