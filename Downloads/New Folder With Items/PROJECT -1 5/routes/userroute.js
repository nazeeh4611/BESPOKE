const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const userRoute = express.Router(); //
const userController = require("../controller/usercontroller");
const cartcontroller = require("../controller/cartcontroller");
const authController = require("../controller/authController");
const addresscontroller = require('../controller/addresscontroller')
const ordercontroller = require("../controller/orderController")
const couponcontroller = require("../controller/couponcontroller");
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

// load error page
userRoute.get("/404",userController.errorpage);

// load about page
userRoute.get("/about",userController.aboutpage)

// load contact page 

userRoute.get("/contact",userController.contactpage)

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
userRoute.get("/logout",userController.userLogout)

//  load and verify forget password
userRoute.get("/forgetpass", userController.lostpassword);
userRoute.post("/forgetpass", userController.lostpasswordVerify);

// reset password after veify forget password
userRoute.get("/resetpass", userAuth.isLogout, userController.newPasswordLoad);
userRoute.post("/resetpass", userController.resetPass);

// load shop
userRoute.get("/shop", userController.loadshop);
userRoute.get("/search", userController.searchProducts);


// load productDetail
userRoute.get("/productdetail", userController.ProductDetail);

// load My Account
userRoute.get("/dashboard", userAuth.isLogin, userController.MyAccount);
userRoute.get("/profile",userAuth.isLogin,userController.myprofile)
userRoute.patch("/editprofile",userAuth.isLogin,userController.editprofile);

//  cart
userRoute.get("/cart",userAuth.isLogin,cartcontroller.cartopen);
userRoute.post("/cart",userAuth.isLogin,cartcontroller.AddToCart);
userRoute.post("/updatecart",cartcontroller.updateCart);
userRoute.delete("/removecart",cartcontroller.removecart);
module.exports = userRoute;

// load address & add address

userRoute.get('/address',userAuth.isLogin,addresscontroller.addresses);
userRoute.get('/addaddress',userAuth.isLogin,addresscontroller.NewAddress);
userRoute.post('/addaddress',addresscontroller.postAddress);
userRoute.patch('/editAddress',addresscontroller.editAddress);
userRoute.delete('/deleteaddress',addresscontroller.deleteAddress);


//  load checkout & orders 
userRoute.get('/checkout',cartcontroller.Loadcheckout)
userRoute.post("/checkout",ordercontroller.OrderPlace)
userRoute.post("/verifypayment",ordercontroller.verifypayment);
userRoute.post("/repay",ordercontroller.repay);
userRoute.get('/ordercomplete',ordercontroller.OrderPlaced);
userRoute.get('/orders',ordercontroller.orderlist);
userRoute.get("/view",ordercontroller.orderview);
userRoute.patch("/cancelorder",ordercontroller.ordercancel);
userRoute.post("/return",ordercontroller.returnOrder);
userRoute.get("/getReason",ordercontroller.resonsend);

// download invoice

userRoute.get("/invoice",ordercontroller.invoiceDownload);
// coupon

userRoute.post('/applycoupon',couponcontroller.applycoupon)
userRoute.post("/removecoupon",couponcontroller.RemoveCoupon);

// load wishlist

userRoute.get('/wishlist',userAuth.isLogin,cartcontroller.loadwishlist);
userRoute.post('/wishlist',userAuth.isLogin,cartcontroller.postwishlist);
userRoute.delete('/removewishlist',userAuth.isLogin,cartcontroller.removefromwishlist);


