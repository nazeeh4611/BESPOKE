const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const Product = require('../model/productModel');
const Order = require('../model/orderModel');
const Category = require('../model/catagoryModel')

// admin login page

const adminLogin = async (req, res) => {
  try {
    res.render("admin/adminlogin",{
     
    });
  } catch (error) {
    console.log(error.message);
  }
};

// verify admin login

const verifyAdminLogin = async (req, res) => {
  try {
    const userData = await User.findOne({ email: req.body.email });
   

    if (userData) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        userData.password,
      );

      if (passwordMatch) {
        req.session.adminId = userData._id;
       
        res.redirect("/admin/dashboard");
      } else {
        messages.message = "Incorrect password"; 
        res.render("admin/adminlogin", { messages });
      }
    } else {
      messages.message = "Incorrect email"; 
      res.render("admin/adminlogin", { messages });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//  load admin dashboard

const adminDashboard = async (req, res) => {
  try {
    res.render("admin/adminhome");
  } catch (error) {
    console.log(error.message);
  }
};

// admin logout

const adminLogout = async (req, res) => {
  try {
    req.session.adminId = null;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

// load usermanagement

const userManagement = async (req, res) => {
  try {
    const Users = await User.find();
    res.render("admin/usermanagement", { Users: Users });
  } catch (error) {
    console.log(error.message);
  }
};

// Block User

const BlockUser = async (req, res) => {
  try {
    const userId = req.query.id;
    const actionType = req.query.action;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).send("user not found");
    }

    const is_Blocked = user.is_Blocked === 1;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { is_Blocked: actionType == 1 ? 0 : 1 } },
      { new: true }
    );

    if (updatedUser) {
      res.redirect("/admin/users");
    } else {
      res.status(500).send("failed to update user");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
};


const orderlist = async(req,res)=>{
  try {
    const Orders = await Order.find().sort({Date:-1});
    res.render("admin/orderDetails",{Orders});
  } catch (error) {
    
  }
}

const orderstatus = async(req,res)=>{
  try {
    const id = req.query.id;

    const orders = await Order.findById({_id:id});

    if(orders.status == 'placed'){
      await Order.findByIdAndUpdate(
        {_id:id},
        {$set:{status:'pending'}},
      );
      res.redirect("/admin/orders")
    }
    if(orders.status == 'pending'){
      await Order.findByIdAndUpdate(
        {_id:id},
        {$set:{status:'placed'}}
      );
      res.redirect("/admin/orders")
    }else{
      res.redirect("/admin/orders")
    }
  } catch (error) {
    console.log(error);
  }
}

const ordercancel = async(req,res)=>{
  try {
    const id = req.query.id;
 const orders = await Order.findById({_id:id});

 if(orders){
  await Order.findByIdAndUpdate(
    {_id:id},
    {$set:{status:'cancelled'}},
  )
 }
   res.redirect('/admin/orders');
  } catch (error) {
    console.log(error);
  }
}


const orderdelivered = async(req,res)=>{
  try {
    const id = req.query.id;
  
    const orders = await Order.findById({_id:id});


    if(orders.status == 'placed'){
      await Order.findByIdAndUpdate(
        {_id:id},
        {$set:{status:'delivered'}},
      )
    }
    if(orders.status == 'waiting for approvel'){
      await Order.findByIdAndUpdate(
        {_id:id},
        {$set:{status:'Return Approved'}}
      )
      res.redirect('/admin/orders')
    }else{
      res.redirect('/admin/orders')
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  adminLogin,
  verifyAdminLogin,
  adminDashboard,
  adminLogout,
  userManagement,
  BlockUser,
  orderlist,
  orderstatus,
  ordercancel,
  orderdelivered,
};
