const User = require("../model/userModel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Category = require("../model/catagoryModel");
const Offer = require("../model/offerModel");
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
    

   const userIn = req.session.userId
    const cartdata = await Cart.findOne({ user: userIn }).populate({
      path: "product.productId",
      model: "Product",
    });

    // const filteredProducts = cartdata.product.filter(product => product.productId.is_Listed);


    const subtotal = cartdata?.product.reduce((acc, val) => acc + val.total, 0);

   

    // res.render("user/home", { userIn, user: req.session.userId, cartdata: {cartdata, product: filteredProducts } });
    res.render("user/home", { userIn, user: req.session.userId, cartdata });
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


// referal code 

function refcodegenarate(){
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  const length = 8;
  let referalcode = '';
  for(let i=0;i<length;i++){
    referalcode+= characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return referalcode;
}


//  verify registration

const verifyRegister = async (req, res) => {
  try {

    const referalcode = req.body.refaralcode;
    console.log("referal code ",referalcode)
    const existUser = await User.findOne({ email: req.body.email });
    if (existUser && existUser.is_Verified) {
      const message = "Email already Registered";
      res.render("user/register", { message });
    } else if (existUser && !existUser.is_Verified) {

      res.render("user/register", { messages: { message: "This Email is already exist" } });
    } else {
      const confirmPassword = req.body.confirmPassword;

    

      if (req.body.password !== confirmPassword) {
        return res.render("user/register", {
          message: "password do not match",
        });
      }
     let referalby = null;

     if(referalcode){
      referalby = await User.findOne({referalcode});
      if(!referalby){
        res.render("user/register", { messages: { message: "Invalid refreal code" } });
       }
     }
   
const newuserrefral = refcodegenarate();
const spassword = await securePassword(req.body.password);

const user = new User({
  name: req.body.name,
  email: req.body.email,
  mobile: req.body.mobile,
  password: spassword,
  confirmpassword: confirmPassword,
  referalcode:newuserrefral,
  referalby: referalby ? referalby._id : null,
});
      const userdata = await user.save();
      req.session.email = req.body.email;
      await sendOtpVerificationMail(userdata, res);

      if(referalby){
        referalby.wallet += 100; 
        referalby.wallethistory.push({
          amount: 100,
          description: 'Amount credited for referel',
          Date: new Date()
      });
        await referalby.save(); 
 
       
        user.wallet += 50; 
        user.wallethistory.push({
            amount: 50,
            description: 'Amount credited for referel',
            Date: new Date()
        });
    }
    await user.save(); 
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
      if(user.is_Blocked == 1){
        res.redirect("/login");
      }
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
    let query = { is_Listed: true, is_Deleted: false };
    const category = req.query.category;
    // Apply category filter if it exists
    if (category) {
      query.category = category;
    }

    let sortOption = {};
    switch (req.query.sort) {
      case "1":
        // Featured
        sortOption = {};
        break;
      case "2":
        // Best selling
        sortOption = {};
        break;
      case "3":
        // Alphabetically, A-Z
        sortOption = { name: 1 };
        break;
      case "4":
        // Alphabetically, Z-A
        sortOption = { name: -1 };
        break;
      case "5":
        // Price, low to high
        sortOption = { price: 1 };
        break;
      case "6":
        // Price, high to low
        sortOption = { price: -1 };
        break;
      case "7":
        // Date, old to new
        sortOption = { date: 1 };
        break;
      case "8":
        // Date, new to old
        sortOption = { date: -1 };
        break;
      default:
        // Default Sorting
        break;
    }

    const offers = await Offer.find({});
 
    let page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = 9;

    let search = req.query.search || '';
        if(req.query.search){
      search = req.query.search
      console.log(search,"here")
    };

    const productDetails = await Product.find({
      ...query,
      $or: [
        { name: { $regex: '.*' + search + '.*', $options: 'i' } },
        { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
        { description: { $regex: '.*' + search + '.*', $options: 'i' } },
      ]
    })
      .populate({
        path: "category",
        model: "Category",
      })
      .populate("offer")
      .sort(sortOption);

   
      const filteredProducts = productDetails.filter(
        product => product.category && product.category.is_Listed
      );
  
      const count = filteredProducts.length;
      const products = filteredProducts
      .slice((page - 1) * limit, page * limit);

    const categories = await Category.find({ is_Listed: true }).populate("offer");

    const userIn = req.session.userId;

    res.render("user/shop", {
      products,
      categories,
      user: req.session.userId,
      userIn,
      totalpages: Math.ceil(count / limit),
      currentpage: page,
      nextpage: page + 1 <= Math.ceil(count / limit) ? page + 1 : 1,
      prevpage: page - 1 >= 1 ? page - 1 : 1,
      req
    });
  } catch (error) {
    console.log(error.message);
  }
};






const searchProducts = async (req, res) => {
  try {
    const query = req.query.searchKeyword;

    if (!query || query.trim().length === 0) {
      const products = await Product.find({
        is_Deleted: false,
        is_Listed: true
      }).populate("category");

      // Fetch all categories
      const categories = await Category.find({});

      return res.render("user/shop", { products, categories, user: req.session.userId });
    }

    const regex = new RegExp(`^${query}`, 'i');

    const products = await Product.find({
      name: regex,
      is_Deleted: false,
      is_Listed: true
    }).populate("category");

    const filteredProducts = products.filter(product => product.name.toLowerCase().startsWith(query.toLowerCase()));

    const categories = await Category.find({});

    res.render("user/shop", { products: filteredProducts, categories, user: req.session.userId });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};










const ProductDetail = async (req, res) => {
  try {
    const productId = req.query.id;

    const productdata = await Product.findById({ _id: productId }).populate(
      "category",
    ).populate(
      "offer"
    );
 
    const userIn = req.session.userId;
    const userId = req.session.userId;


    const cartdata = await Cart.findOne({ user: userId }).populate({
      path: "product.productId",
      model: "Product",
    });


     
  

    // const filteredProducts = cartdata.product.filter(product => product.productId.is_Listed);

    // : {cartdata, product: filteredProducts }



    res.render("user/productdetail", {
      cartdata,
      data: productdata,
      user: req.session.userId,
      userIn,
      user: req.session.userId,
    });
  } catch (error) {
    console.log(error.message);
  }
};


const errorpage = async(req,res)=>{
  try {
    res.render("user/404");
  } catch (error) {
    console.log(error);
  }
}





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
  searchProducts,
  ProductDetail,
  errorpage,
};
