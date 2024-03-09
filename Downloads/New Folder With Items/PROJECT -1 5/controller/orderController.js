const Order = require("../model/orderModel");
const Product = require("../model/productModel");
const category = require("../model/catagoryModel");
const User = require('../model/userModel');
const Address = require("../model/addressModel")
const Cart = require("../model/cartModel");


const OrderPlace = async (req, res) => {
  try {
      const userId = req.session.userId;
      const { addressId, subtotal, paymentMethod } = req.body;

      console.log("all data here", req.body.addressId, subtotal, paymentMethod);

      const cartdata = await Cart.findOne({ user: userId });

      if (!addressId) {
          return res.json({
              success: false,
              message: "Select the address and payment method before placing the order",
          });
      }

      const userAddress = await Address.findOne({
          "address._id": addressId,
      });
      console.log("user",);
      console.log("delivery details here", userAddress);
      // Check if userAddress is not empty and has at least one address
      if (!userAddress || userAddress.length === 0) {
          return res.json({
              success: false,
              message: "Please select a valid address",
          });
      }

      // Since userAddress is an array, use userAddress[0] if it exists
      const addressObject = userAddress.address[0];
      console.log(addressObject,"obhdhjg");

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
      const orderStatus = paymentMethod === "COD" ? "placed" : "pending";
  
      const NewOrder = new Order({
        deliveryDetails:addressObject,
          user: userdata._id,
          username: userdata.name,
          paymentmethod: paymentMethod,
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

      if (paymentMethod === "COD") {
          for (const cartProduct of cartdata.product) {
              await Product.findOneAndUpdate(
                  { _id: cartProduct.productId },
                  { $inc: { quantity: -cartProduct.quantity } }
              );
          }
      }

      const DeleteCartItem = await Cart.findOneAndDelete({ user: userId });

      return res.json({ success: true, orderId: orderId });

  } catch (error) {
      console.log(error);
      return res.json({
          success: false,
          message: "Unexpected error occurred. Please try again later."
      });
  }
};

  

  


const OrderPlaced = async(req,res)=>{
    try {
        const id =req.query._id;
        console.log("id here",id);

        const userId = req.session.userId;

        const userData = await User.findOne({_id:userId});
        const order = await Order.findOne({_id:id});
        res.render("user/ordercomplete" ,{order:order})
    } catch (error) {
        console.log(error);
    }
}

const orderlist = async(req,res)=>{
    try {
        const userId = req.session.userId;
        const userData =  await User.findOne({_id:userId});
        const Orders = await Order.findOne({user:userId}).sort({Date:-1});
        res.render("user/orderlist",{userId,userData,Orders})
    } catch (error) {
        console.log(error);
    }
}




module.exports = {
 OrderPlace,
 OrderPlaced,
 orderlist,


}