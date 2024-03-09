const User = require("../model/userModel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Category = require("../model/catagoryModel");
const bcrypt = require("bcrypt");
require("dotenv").config();
const randomstrings = require("randomstring");
const { sendOtpVerificationMail } = require("../utils/sentotp");
const userOtpVerification = require("../model/userOtpVerification");
const { name } = require("ejs");
const nodemailer = require("nodemailer");

//  homepage

const loadHome = async (req, res) => {
  try {
    const userIn = req.session.userId;


    const cartdata = await Cart.findOne({ user: userIn }).populate({
      path: "product.productId",
      model: "Product",
    });



    const subtotal = cartdata?.product.reduce((acc, val) => acc + val.total, 0);

   

    res.render("user/home", { userIn, user: req.session.userId,cartdata,subtotal });
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
    if (existUser && existUser.is_Verified) {
      const message = "Email already Registered ";
      res.render("user/register", { message });
    } else if (existUser && !existUser.is_Verified) {
      const message =
        "Email already registered but not not verified. send OTP to email and verify the Email ";
      res.render("user/register", { message });
    } else {
      const confirmPassword = req.body.confirmPassword;

      const spassword = await securePassword(req.body.password);

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

    if (user) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );

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
        const updateData = await User.updateOne(
          { email: email },
          { $set: { token: randomstring } }
        );
        sendForgetEmail(Details.name, Details.email, randomstring);
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

// for reset password send email

const sendForgetEmail = async (name, email, token) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Email_USERNAME,
        pass: process.env.Email_Password,
      },
    });

    const mailOptions = {
      from: process.env.Email_USERNAME,
      to: email,
      subject: "Password Reset",
      html: `<p>Hello ${name}, please click <a href="http://127.0.0.1:3009/resetpass?token=${token}">here</a> to reset your password.</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const newPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    console.log("the token data is here", tokenData);
    if (tokenData) {
      res.render("user/passwordforget", { message: "", tokenData: tokenData });
    } else {
      res.redirect("/forgetpass");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resetPass = async (req, res) => {
  try {
    const password = req.body.password;
    console.log(" the password of password", password);
    const confirmpassword = req.body.confirmpassword;
    const user_id = req.body.user_id;
    console.log("userd", user_id);
    if (password == confirmpassword && user_id) {
      const securepassword = await securePassword(password);
      const updatedData = await User.findByIdAndUpdate(
        { _id: user_id },
        { $set: { password: securepassword, token: "" } }
      );
      res.redirect("/login");
    } else {
      res.render("user/passwordforget", { message: "password does not match" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// load MyAccount----------------------
const MyAccount = async (req, res) => {
  try {
    const userId = req.session.userId;
    const userid = await User.findOne({ _id: userId });


    res.render("user/userdashboard", { userid });
  } catch (error) {
    console.log(error.message);
  }
};


const myprofile = async(req,res)=>{
  try {
    const userId = req.session.userId;
    const profiledata = [await User.findById({_id:userId})];
    res.render("user/profile",{userId,profiledata})
  } catch (error) {
    console.log(error);
  }
}

const editprofile = async(req,res)=>{
  try {
    const name = req.body.Fullname;
    const number = req.body.Mobile;
    const email = req.body.Email;
   console.log("all date here",name,number,email);

     const userId = req.session.userId;

     const extemail = await User.findOne({email:email});
     if(extemail){
      await User.updateOne({_id:userId},{$set:{
        name:name,
        mobile:number,
        email:email,
      }})
     }

     res.json({status:true  })
  } catch (error) {
    
  }
}

const userLogout = async (req, res) => {
  try {
    req.session.userId = null;
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

// load shop----------------------------

const loadshop = async (req, res) => {
  try {
    let query = { is_Listed: true };
    if (req.query.category) {
      query.category = req.query.category;
      console.log("lo",req.query.category);
    }
    const productDetailes = await Product.find(query).populate("category");
    const products = productDetailes.filter((product) => {
      if (product.category && product.category.is_Listed == 1) {
        return product;
      }
    });

    // fetch the categories for dropdown

    const categories = await Category.find({});
    const userIn = req.session.userId;
    res.render("user/shop", {
      products,
      categories,
      user: req.session.userId,
      userIn,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const ProductDetail = async (req, res) => {
  try {
    const productId = req.query.id;
    console.log("suii", productId);
    const product = await Product.findById({ _id: productId }).populate(
      "category"
    );
    const userIn = req.session.userId;
    const userId = req.session.userId;
    console.log("jk", userId);

    const cartdata = await Cart.findOne({ user: userId }).populate({
      path: "product.productId",
      model: "Product",
    });



    const subtotal = cartdata?.product.reduce((acc, val) => acc + val.total, 0);


    res.render("user/productdetail", {
      data: product,
      user: req.session.userId,
      userIn,
      cartdata,
      subtotal,
      user: req.session.userId,
    });
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
  sendForgetEmail,
  lostpasswordVerify,
  newPasswordLoad,
  MyAccount,
  myprofile,
  editprofile,
  userLogout,
  resetPass,
  loadshop,
  ProductDetail,
};
