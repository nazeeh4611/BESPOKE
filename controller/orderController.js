const Order = require("../model/orderModel");
const Product = require("../model/productModel");
const category = require("../model/catagoryModel");
const User = require('../model/userModel');
const Address = require("../model/addressModel")
const Cart = require("../model/cartModel");
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { ok } = require("assert");
const path = require("path");
const { ObjectId } = require('mongodb');
const puppeteer = require("puppeteer-core")
const ejs = require("ejs")
const fs = require("fs")
const numberToWords = require('number-to-words');
var instance = new Razorpay({
  key_id: 'rzp_test_5mTjMS04uhfKer',
  key_secret:process.env.RAZORPAY_SECRET,
});


const OrderPlace = async (req, res) => {
    try {
        const userId = req.session.userId;

        const { addressId, paymentMethod,subtotal,discount,discountamount} = req.body;
        console.log(discount,"order discount")

        console.log(discountamount," coupon dis here")

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
        const orderStatus = paymentMethod=== "CASH ON DELIVERY" ||paymentMethod === "WALLET" ? "placed" : "pending";
         console.log("status",orderStatus)
         
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
                brand:product.brand,
                quantity: product.quantity,
                status:orderStatus,
                coupondiscount:discountamount,

            })),
            subtotal: subtotal,
            status: orderStatus,
            Date: Date.now(),
            expiredate: expireDate,
            discount:discount
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

        }else if(paymentMethod == 'WALLET'){
            for (const cartProduct of cartdata.product) {
                await Product.findOneAndUpdate(
                    { _id: cartProduct.productId },
                    { $inc: { quantity: -cartProduct.quantity } }
                );
            }

            const DeleteCartItem = await Cart.findOneAndDelete({ user: userId });
           
           const walletreduce = await User.findByIdAndUpdate(
            {_id:userId},
            {$inc:{wallet:-subtotal}},
            )
            const user = await User.findByIdAndUpdate(userId, {
                $push: {
                    wallethistory: {
                        description: 'Amount debited for paying the order',
                        amount: -subtotal,
                        Date: new Date() 
                    }
                }
            }, { new: true });
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
          { $inc: { quantity: -cartdata.quantity } },
          {$set:{status:"placed"}},
        );
      }
  }

  const NewOrder = await Order.findByIdAndUpdate(
    { _id: Data.orders.receipt },
    {
        $set: {
            status: 'placed',
            'product.$[].status': 'placed'
        }
    },
    {
        new: true 
    }
);

console.log(NewOrder);
  

  const cartdata = await Cart.findOne({user:userId})
  const orderId = await NewOrder._id;
  const DeleteCartItem = await Cart.deleteOne({_id:cartdata._id });
  for (const cartProduct of cartdata.product) {
    await Product.findOneAndUpdate(
        { _id: cartProduct.productId },
        { $inc: { quantity: -cartProduct.quantity } }
    );
}

  res.json({orderId,success:true});
    } catch (error) {
        
    }
}
  

  


const OrderPlaced = async(req,res)=>{
    try {
    
        const orderId =req.query.id;

        const userId = req.session.userId;
         const date = new Date();

        const userData = await User.findOne({_id:userId});
        const order = await Order.findOne({_id:orderId});
   
        res.render("user/ordercomplete" ,{order:order,date,orderId:orderId})

    } catch (error) {
        console.log(error);
    }
}

const orderlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = 10;
        const userData = await User.findOne({ _id: userId });

        const skip = (page - 1) * limit;

     
         const Orders = await Order.find({ user: userId })
         .sort({ Date: -1 }) 
         .skip(skip)
         .limit(limit);


        const totalOrders = await Order.countDocuments({ user: userId });

        const totalPages = Math.ceil(totalOrders / limit);

        const startIndex = (page -1) * limit;

        res.render('user/orderlist', {
            userId,
            userData,
            Orders,
            totalPages,
            currentPage: page,
            nextPage: page < totalPages ? page + 1 : totalPages,
            prevPage: page > 1 ? page - 1 : 1,
            startIndex: startIndex,  
            req
        });
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('An error occurred while fetching orders.');
    }
};



const orderview = async(req,res)=>{
    try {
    const orderId = req.query.id;
   
    const userId = req.session.userId;
    const userData = await User.findOne({_id:userId});
    const orderdata = await Order.findById({_id:orderId}).populate(
     "product.productId",
    )
  orderdata.product.forEach((value)=>{

  })
 res.render("user/orderview",{orderdata,userData,userId});
    } catch (error) {
        console.log(error)
    }}


    const invoiceDownload = async (req, res) => {
        try {
            let orderId = req.query.orderId;
            let productId = req.query.productId;
          
            const orderData = await Order.findOne({ _id: orderId })
                .populate('user')
                .populate('product.productId'); 
    
            let order = orderData;
            let product;
    
            orderData.product.forEach((prod) => {
                let a = prod._id.toString();
                if (a === productId) {
                    product = prod;
                }
            });
    
            let totalPrice, totalPriceInWords;
            if (product.coupondiscount > 0) {
                totalPrice = product.price * product.quantity - product.coupondiscount;
                totalPriceInWords = numberToWords.toWords(totalPrice) + " rupees ";
            } else {
                totalPrice = product.price * product.quantity;
                totalPriceInWords = numberToWords.toWords(totalPrice) + " rupees ";
            }
    
            const paisa = Math.round((totalPrice - Math.floor(totalPrice)) * 100);
            totalPriceInWords += (paisa > 0 ? "and " + numberToWords.toWords(paisa) + " paisa " : "only");
    
        const date = new Date();
        const datas = {
            order: order,
            date,
            product,
            totalPriceInWords,
            baseUrl: 'http://' + req.headers.host
        };

        const filepath = path.resolve(__dirname, "../views/user/invoice.ejs");
        const htmlTemplate = fs.readFileSync(filepath, 'utf-8');
        const invoiceHtml = ejs.render(htmlTemplate, datas);

        const updatedHtml = invoiceHtml.replace(/src="\/public\/images\/([^"]*)"/g, (match, src) => {
            const imageFile = fs.readFileSync(path.resolve(__dirname, '../public/images', src));
            const base64Image = imageFile.toString('base64');
            return `src="data:image/jpg;base64,${base64Image}"`;
        });

        const browser = await puppeteer.launch({ 
            headless: "new",
            executablePath: '/snap/bin/chromium',
        });
        const page = await browser.newPage();

        await page.setContent(updatedHtml, { waitUntil: "networkidle0" });

        const pdfBytes = await page.pdf({ format: "Letter" });
        await browser.close();

      
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename = BESPOKE-INVOICE.pdf"
        );
        res.send(pdfBytes);
// res.render("user/invoice",{product,order,
//     totalPriceInWords,})
    } catch (error) {
        console.log(error.message);
        res.status(500).send("error in generate invoice");
    }
}




const ordercancel = async(req,res)=>{
    try {
       const userId = req.session.userId;
       const orderId = req.body.orderId;
       const productId = req.body.productId;
       const prdtid = req.body.prdtid;
       console.log(userId,orderId,productId,prdtid)
       const order = await Order.findById({_id:orderId});
       const productIndex = order.product.findIndex(item => item._id.toString() === productId);
      let data =  order.product[productIndex].status = 'cancelled';
      let qnty = order.product[productIndex].quantity;
      console.log(order.paymentMethod)
  console.log(data)
  if(data){

   const product = await Product.findByIdAndUpdate(
    {_id:prdtid},
    {$inc:{quantity:qnty}},
    {new:true},
    )
       

    if(order.paymentMethod == "RAZORPAY"){
        await order.save();
        res.json({success:true})
        const userUpdateResult = await User.findByIdAndUpdate(
            userId,
            {
                $inc: { wallet: order.product[productIndex].price },
                $push: {
                    wallethistory: {
                        description: 'Amount Credited cancel Order',
                        amount: order.product[productIndex].price,
                        Date: new Date()
                    }
                }
            },
            { new: true } 
        );
    }else{
    await order.save();
    res.json({success:true})
    }
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
        const orderId = req.body.orderId
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


const repay = async (req, res) => {
    try {
        const { orderId, totalamount } = req.body;
        const orders = await instance.orders.create({
            amount: totalamount * 100, 
            currency: "INR",
            receipt: "" + orderId,
        });

       
       

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
repay,
verifypayment,
invoiceDownload,
}