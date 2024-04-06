const Order = require("../model/orderModel");
const Product = require("../model/productModel");
const category = require("../model/catagoryModel");
const User = require('../model/userModel');
const Address = require("../model/addressModel")
const Cart = require("../model/cartModel");
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { ok } = require("assert");
var instance = new Razorpay({
  key_id: 'rzp_test_5mTjMS04uhfKer',
  key_secret:process.env.RAZORPAY_SECRET,
});


const OrderPlace = async (req, res) => {
    try {
        const userId = req.session.userId;

        const { addressId, paymentMethod,subtotal} = req.body;

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
    

        if (!userAddress || userAddress.length === 0) {
            return res.json({
                success: false,
                message: "Please select a valid address",
            });
        }
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
        const orderStatus = paymentMethod=== "CASH ON DELIVERY" ? "placed" : "pending";

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
            

            res.json({success:false,orders })
        }
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Unexpected error occurred. Please try again later."
        });
    }
}
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
          { $inc: { quantity: -quantity } },
          {$set:{status:"placed"}},
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
    )
  orderdata.product.forEach((value)=>{

  })

  
    res.render("user/orderview",{orderdata,userData,userId});
    } catch (error) {
        console.log(error)
    }
}

const ordercancel = async(req,res)=>{
    try {
       const userId = req.session.userId;
       const orderId = req.body.orderId;
       const productId = req.body.productId;

       console.log(userId,orderId,productId)
       const order = await Order.findById({_id:orderId});
       const productIndex = order.product.findIndex(item => item._id.toString() === productId);
       console.log(productIndex,"productIndex")
      let data =  order.product[productIndex].status = 'cancelled';
  console.log(data)
  if(data){
    order.product[productIndex].status = 'cancelled';
    await order.save(); // Save the updated order
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

const returnOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const reason = req.body.Reason;
        const { orderId, productId } = req.body; 

        console.log("orderId",orderId)
        console.log("productId",productId)
        console.log("reason",reason)

        if (!orderId || !productId) {
            return res.status(400).json({ error: "orderId and productId are required" });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (Date.now() > order.expiredate) {
            return res.json({ datelimit: true });
        } else {
            const productIndex = order.product.findIndex(item => item._id.toString() === productId);

            if (productIndex === -1) {
                return res.status(404).json({ error: "Product not found in order" });
            }

            console.log(productIndex,"index here");
            console.log(order.product[productIndex].status,"status here");

            order.product[productIndex].status = 'waiting for approval';
            console.log(order.product[productIndex].status,"status here after");

            order.product[productIndex].reason = reason;
              console.log("ethitt", order.product[productIndex].reason);
            await order.save(); 

            return res.json({ return:true });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


const resonsend = async(req,res)=>{
    try {
        const productId = req.query.productId;
        console.log("ivade ethhi",productId)
        const orderId = req.body.orderId
        console.log("ivade ethhi",productId)
        console.log("ivade ethhi",orderId)
        const order = await Order.findOne({ 'product._id': productId });
          
console.log(order,"o")
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const product = order.product.find(item => item._id.toString() === productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found in order' });
        }
        console.log(product.reason,"reson ");
        res.json({ reason: product.reason });
    } catch (err) {
        console.error('Error fetching reason:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const orderrazor = async (req, res) => {
    try {
        const { orderId, totalamount } = req.body;
        const orders = await instance.orders.create({
            amount: totalamount * 100, 
            currency: "USD",
            receipt: "" + orderId,
        });

       
        razorpay(orders);

        return res.json({ success: true, orders });
    } catch (error) {
        console.error('Error in orderrazor:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

module.exports = {
 OrderPlace,
 OrderPlaced,
 orderlist,
orderview,
ordercancel,
returnOrder,
resonsend,
orderrazor,
verifypayment,
}