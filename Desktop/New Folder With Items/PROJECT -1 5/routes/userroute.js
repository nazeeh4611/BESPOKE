const express = require("express");
const bodyParser = require('body-parser');

const userRoute = express.Router(); //
const userController = require("../controller/usercontroller");
const userAuth = require('../middlewares/userAuth')

// Middleware
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));
userRoute.use(bodyParser.urlencoded({extended:true}));

// Define routes


// load homepage
userRoute.get('/',userController.loadHome)

// load and verify register
userRoute.get("/register",userAuth.isLogout,userController.userRegister)
userRoute.post("/register", userController.verifyRegister);

// load and verify OTP and resend OTP
userRoute.get("/otp",userAuth.isLogout,userController.loadotp);
userRoute.get('/sendotp',userController.getsendOtp);
userRoute.post("/otp", userController.verifyotp);
userRoute.post("/resend-otp",userController.resentOtp);

// load and verify login page
userRoute.get("/login",userAuth.isLogout,userController.userLogin);
userRoute.post("/login", userController.verifylogin);

//  load and verify forget password
userRoute.get("/forgetpass",userController.lostpassword);
userRoute.post("/forgetpass",userController.lostpasswordVerify);

// reset password after veify forget password
userRoute.get("/resetpass",userAuth.isLogout,userController.newPasswordLoad)
userRoute.post('/resetpass',userController.resetPass)


// load shop
userRoute.get("/shop",userAuth.isLogin,userController.loadshop);

// load My Account
userRoute.get("/profile",userAuth.isLogin,userController.MyAccount);

module.exports = userRoute;
