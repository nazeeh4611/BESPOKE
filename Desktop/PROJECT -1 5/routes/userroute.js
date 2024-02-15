const express = require("express");
const userRoute = express.Router(); //
const userController = require("../controller/usercontroller");
const userAuth = require('../middlewares/userAuth')

// Middleware
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));

// Define routes

userRoute.get('/',userController.loadHome)
userRoute.get("/register",userAuth.isLogout,userController.userRegister)
userRoute.post("/register", userController.verifyRegister);
userRoute.get("/otp",userAuth.isLogout,userController.loadotp);
userRoute.get('/sendotp',userController.getsendOtp);
userRoute.post("/otp", userController.verifyotp);
userRoute.post("/resend-otp",userController.resentOtp);
userRoute.get("/login",userAuth.isLogout,userController.userLogin);
userRoute.post("/login", userController.verifylogin);
// userRoute.get("/home",userAuth.isLogin,userController.afterlogin);
userRoute.get("/profile",userAuth.isLogin,userController.MyAccount);
userRoute.get("/forgetpass",userController.lostpassword);
userRoute.post("/forgetpass",userController.lostpasswordVerify);
userRoute.get("/forgetsetpass",userAuth.isLogout,userController.newPasswordLoad)
// userRoute.post('/forgetsetpass',userController.resetPass)

module.exports = userRoute;
