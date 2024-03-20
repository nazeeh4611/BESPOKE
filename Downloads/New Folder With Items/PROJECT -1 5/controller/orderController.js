const Order = require("../model/orderModel");
const Product = require("../model/productModel");
const category = require("../model/catagoryModel");
const User = require('../model/userModel');
const Address = require("../model/addressModel")
const Cart = require("../model/cartModel");
const Razorpay = require('razorpay');
const crypto = require('crypto')
var instance = new Razorpay({
  key_id: 'rzp_test_5mTjMS04uhfKer',
  key_secret:process.env.RAZORPAY_SECRET,
});

const OrderPlace = async (req, res) => {
    try {
        const userId = req.session.userId;

  
        const { addressId, paymentMethod,subtotal} = req.body;
  
  console.log("the address id here",addressId,"the payment here",paymentMethod,"subtotal here",subtotal);
        const cartdata = await Cart.findOne({ user: userId });
  
        if (!addressId || !paymentMethod) {
            return res.json({
                success: false,
                message: "Select the address and payment method before placing the order",
            });
        }
  
        const userAddress = await Address.findOne({
            "address._id": addressId,
        });
     
       console.log(userAddress);
        // Check if userAddress is not empty and has at least one address
        if (!userAddress || userAddress.length === 0) {
            return res.json({
                success: false,
                message: "Please select a valid address",
            });
        }
  
        // Since userAddress is an array, use userAddress[0] if it exists
        const addressObject =userAddress.address.filter((address)=> address._id==addressId);
        

        const userdata = await User.findOne({ _id: req.session.userId });
  
        for (const cartProduct of cartdata.product) {
            const productData = await Product.findOne({ _id: cartProduct.productId });
  
            if (cartProduct.quantity > productData.quantity) {
                return res.json({
                    success: false,
                    message: `Not enough stock available on: ${productData.name}`,
                });
            }
        }
  
        const expireDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  
        const products = cartdata.product;
        const orderStatus = paymentMethod === "CASH ON DELIVERY" ? "placed" : "pending";
    
        const NewOrder = new Order({
          deliveryDetails:addressObject,
            user: userdata._id,
            username: userdata.name,
            paymentMethod: paymentMethod,
            product: products.map(product => ({
                productId: product.productId,
                name: product.name,
                price: product.price,
                category:product.category,
                quantity: product.quantity,
            })),
            subtotal: subtotal,
            status: orderStatus,
            Date: Date.now(),
            expiredate: expireDate,
  
        });
  
        const saveOrder = await NewOrder.save();
        const orderId = saveOrder._id;
        const totalamount = saveOrder.subtotal;
  
        if (paymentMethod === "CASH ON DELIVERY") {
            for (const cartProduct of cartdata.product) {
                await Product.findOneAndUpdate(
                    { _id: cartProduct.productId },
                    { $inc: { quantity: -cartProduct.quantity } }
                );
            }
     
  
        const DeleteCartItem = await Cart.findOneAndDelete({ user: userId });
        
         res.json({success:true,orderId})
    }else{
        const orders = await instance.orders.create({
            amount: totalamount * 100,
            currency: "INR",
            receipt: "" + orderId,
            })
            console.log(orders,"all data will bw here");

             res.json({success:false,orders })
        console.log("hoifhdfshsofgsof");
    }
   
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Unexpected error occurred. Please try again later."
        });
    }
  };
  
  
const verifypayment = async(req,res)=>{
    try {
        const userId = req.session.userId;
        const Data = req.body;

        let hmac = crypto.createHmac('sha256',process.env.RAZORPAY_SECRET);
        hmac.update(Data.razorpay_order_id + "|" + Data.razorpay_payment_id)
        const hmacvalue = hmac.digest('hex');


  if (hmacvalue == Data.razorpay_signature) {
    for (const Data of Cart.product) {
        const { productId, quantity } = Data;
        await Product.findByIdAndUpdate(
          { _id: productId },
          { $inc: { quantity: -quantity } }
        );
      }
  }
  
  const NewOrder = await Order.findByIdAndUpdate(
    {_id:Data.orders.receipt},
    {$set:{status:'placed'}},
  )

  const cartdata = await Cart.findOne({user:userId})
  const orderId = await NewOrder._id;

  const DeleteCartItem = await Cart.deleteOne({_id:cartdata._id });
  console.log("item deleted from cart ",DeleteCartItem);
  res.json({orderId,success:true});
    } catch (error) {
        
    }
}
  

  


const OrderPlaced = async(req,res)=>{
    try {
    
        const id =req.query.id;

        const userId = req.session.userId;
         const date = new Date();

        const userData = await User.findOne({_id:userId});
        const order = await Order.findOne({_id:id});
   
        res.render("user/ordercomplete" ,{order:order,date,orderId:id})

    } catch (error) {
        console.log(error);
    }
}

const orderlist = async(req,res)=>{
    try {
        
        const userId = req.session.userId;
        const userData =  await User.findOne({_id:userId});
        const  Orders  = await Order.find({user:userId}).sort({Date:-1});
         res.render("user/orderlist",{userId,userData,Orders})
    } catch (error) {
        console.log(error);
    }
}


const orderview = async(req,res)=>{
    try {
    const id = req.query.id;
   
    const userId = req.session.userId;
    const userData = await User.findOne({_id:userId});
    const orderdata = await Order.findById({_id:id}).populate(
     "product.productId",
    );
  
    res.render("user/orderview",{orderdata,userData,userId});
    } catch (error) {
        
    }
}

const ordercancel = async(req,res)=>{
    try {
       const userId = req.session.userId;
       const orderId = req.body.orderId;
     
       const order = await Order.findById({_id:orderId});

  const data = await Order.findByIdAndUpdate(
    {user:userId,
    _id:orderId},
    {$set:{status:'cancelled'}},
    {new:true},
  )
  if(data){
    res.json({success:true})
  }else{
    res.json({
        success:false,
        message:"order is not found",
    })
  }
    } catch (error) {
        console.log(error.message);
        res.json({success:false,error:error.message});
    }
}

const returnOrder = async(req,res)=>{
    try {
        const userId = req.session.userId;
       
        const orderId = req.body.orderId;
        
       
        const orders = await Order.findById({_id:orderId});

       
        if(Date.now()>orders.expiredate){
            res.json({datelimit:true});
        }else{
            await Order.findByIdAndUpdate(
                {_id:orderId},
                {$set:{status:'waiting for approvel'}}
            );
            res.json({return:true})
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({error:"Internal server error"});
    }
}


const orderrazor = async(req,res)=>{
    try {
        const {orderId,totalamount} = req.body;
   const orders = await instance.orders.create({
            amount: totalamount * 100,
            currency: "INR",
            receipt: "" + orderId,
            })
            return res.json({success:true,orders })
    } catch (error) {
        
    }
}

module.exports = {
 OrderPlace,
 OrderPlaced,
 orderlist,
orderview,
ordercancel,
returnOrder,
orderrazor,
verifypayment,
}