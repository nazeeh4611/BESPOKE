const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const Product = require('../model/productModel');
const Order = require('../model/orderModel');
const Category = require('../model/catagoryModel')
const Offer = require("../model/offerModel");

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
    let messages = {};
    const userData = await User.findOne({ email: req.body.email });
   

    if (userData) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        userData.password,
      );

      if (passwordMatch && userData.is_Admin == 1) {
        req.session.adminId = userData._id;
       
        res.redirect("/admin/dashboard");
      } else {
        messages.message = "Incorrect password"; 
        res.render("admin/adminlogin", { messages:{message:"incorrect email or password"}});
      }
    } else {
      messages.message = "Incorrect email"; 
      res.render("admin/adminlogin", { messages:{message:"incorrect email or password"} });
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
    res.render("admin/orderlist",{Orders});
  } catch (error) {
   console.log(error)
  }
}




const orderDetails = async(req,res)=>{
  try {

    const orderId = req.query.id;
    console.log(orderId,"orderId")
    const Orders = await Order.findOne({_id:orderId}).sort({Date:-1});
    res.render("admin/orderDetails",{Orders});
  } catch (error) {
    console.log(error)
  }
}

const orderstatus = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { orderId, id } = req.body;

    console.log("reached", orderId)
    const order = await Order.findOne({ _id: orderId });
    console.log("rrrrrrr", order)

    if (!order) {
      console.log("Order not found");
      return res.redirect("/admin/orders");
    }

    const productIndex = order.product.findIndex(item => item._id.toString() === id);
    console.log(productIndex, "index")

    if (productIndex === -1) {
      return res.redirect("/admin/orders");
    }

    const product = order.product[productIndex];

    console.log("poooooo")

    if (product.status === 'pending') {
      order.product[productIndex].status = 'placed';
    } else if (product.status === 'placed') {
      order.product[productIndex].status = 'shipped';
    } else if (product.status === "shipped") {
      order.product[productIndex].status = 'out for delivery';
    } else if (product.status === 'out for delivery') {
      order.product[productIndex].status = 'delivered';
    } else if (product.status === 'waiting for approval') {
      console.log("Product status: waiting for approval");
      order.product[productIndex].status = 'returned';
      order.product[productIndex].reason = '';

      const user = await User.findById(userId);
      if (user) {
        user.wallet += product.price * product.quantity;

        // Update wallet history
        user.wallethistory.push({
          amount: product.price * product.quantity,
          description: 'Amount credited for returned product',
          Date: new Date()
        });

        await user.save();
      }
    }

    await order.save();

    res.redirect("/admin/orders");
  } catch (error) {
    console.log("Error:", error);
    res.redirect("/admin/orders");
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
     const userId = req.session.userId;
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
      await User.findByIdAndUpdate(
        {_id:userId},
        {$inc:{wallet:orders.subtotal}}
    )
      res.redirect('/admin/orders')
    }else{
      res.redirect('/admin/orders')
    }
  } catch (error) {
    console.log(error);
  }
}




const salesReport = async(req,res)=>{
  try {
    const orderData = await Order.find({ 'product.status': 'delivered' })
    .populate({
      path: 'user',
      model: 'User',
    })
    .populate({
      path: 'product.productId',
      model: 'Product',
    })
    .sort({ Date: -1 });
    const overallData=await Order.aggregate([
      { 
          $group:{
              _id:'',
              totalSalesCount:{$sum:1},
              totalOrderAmount:{$sum:'$subtotal'},
          }
      }
  ])
  console.log('overallData:',overallData);
    res.render("admin/sales",{orderData,overallData})
  } catch (error) {
    console.log(error)
  }
}


const filterSales = async (req, res) => {
  try {
    let fromdate, todate;
    const currentDate = new Date();

    const overallData=await Order.aggregate([
      { 
          $group:{
              _id:'',
              totalSalesCount:{$sum:1},
              totalRevenue:{$sum:'$subTotal'},
          }
      }
  ])
  console.log('overallData:',overallData);

    const range = req.body.range;
    switch (range) {
      case 'daily':
        fromdate = new Date(currentDate);
        fromdate.setHours(0, 0, 0, 0);
        todate = new Date(currentDate);
        todate.setHours(23, 59, 59, 999);
        break;
        case 'weekly':
          const currentDateCopy = new Date(currentDate); 
          const firstDayOfWeek = new Date(currentDateCopy.setDate(currentDateCopy.getDate() - currentDateCopy.getDay())); 
          const lastDayOfWeek = new Date(currentDateCopy.setDate(currentDateCopy.getDate() + 6)); 
          fromdate = new Date(firstDayOfWeek);
          fromdate.setHours(0, 0, 0, 0);
          todate = new Date(lastDayOfWeek);
          todate.setHours(23, 59, 59, 999);
          break;
        
      case 'monthly':
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        fromdate = new Date(firstDayOfMonth);
        fromdate.setHours(0, 0, 0, 0);
        todate = new Date(lastDayOfMonth);
        todate.setHours(23, 59, 59, 999);
        break;
      case 'yearly':
        const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1); 
        const lastDayOfYear = new Date(currentDate.getFullYear() + 1, 0, 0); 
        fromdate = new Date(firstDayOfYear);
        fromdate.setHours(0, 0, 0, 0);
        todate = new Date(lastDayOfYear);
        todate.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        fromdate = req.body.fromdate ? new Date(req.body.fromdate) : null;
        if (fromdate) fromdate.setHours(0, 0, 0, 0);
        todate = req.body.todate ? new Date(req.body.todate) : null;
        if (todate) todate.setHours(23, 59, 59, 999);
        break;
    }

    const orderData = await Order.find({
      Date: { $lt: todate || currentDate, $gt: fromdate || new Date(0) }, 
      
    })
      .populate({
        path: 'user',
        model: 'User',
      })
      .populate({
        path: 'product.productId',
        model: 'Product',
      })
      .sort({ Date: -1 });

    res.render("admin/sales", { orderData,overallData });

  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error"); 
  }
}



module.exports = {
  adminLogin,
  verifyAdminLogin,
  adminDashboard,
  adminLogout,
  userManagement,
  BlockUser,
  orderDetails,
  orderlist,
  orderstatus,
  ordercancel,
  orderdelivered,
  salesReport,
  filterSales,
};