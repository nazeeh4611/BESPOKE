const Cart = require("../model/cartModel");
const Category = require("../model/catagoryModel");
const User = require("../model/userModel");
const Product = require("../model/productModel");
const { Long } = require("mongodb");
const { session } = require("passport");



const cartopen = async(req,res)=>{
    try {
        const userId = req.session.userId
        if(userId){
            const cartdata = await Cart.findOne({user:userId}).populate({
                path:"product,productId",
                model:"Product",
            });
            const subtotal = cartdata?.product.reduce(
                (acc,value)=>{
                    acc+val.total,0
                }
            )
            res.render("user/cart",{cartdata,subtotal,user: req.session.userId});
        }else{
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message);
    }
}


const AddToCart = async(req,res)=>{
    try {
       const {userId} = req.session;
       if(!userId){
        return res.json({session:false,error:"please login"})
       } 

       const userdata = await User.findOne({_id:userId});

       if(!userdata){
        res.json({session:false,error:"user not found"});
       }
       const productId = req.body.productId;
       const productdata = await Product.findById(productId)

       if(!productdata || productdata.quantity === 0){
        res.json({quantity:false,error:"Product is not found or Out of Stock"});
       }
       const existProduct = await Cart({user:userId,"product.productId":productId})

       if(existProduct){
        const UpdatedCart = await Cart.findByIdAndUpdate(
            {
            user:userId,
            "product.productId":productId,
        },
        {
            $inc:{"product.$.quantity":1}
        },
        {new:true},
        
        );
        return res.json({success:true,stock:true,UpdatedCart});
       }else{
        const cartdata = await Cart.findByIdAndUpdate({
            user:userId,
        },
        {
            $set:{user:userId},
            $push:{
            product:{
            product:productId,
            price:productdata.price,
            quantity:1,
            total:productdata.price,
        },
        },
       },
       {upsert:true,new:true}
        );
       }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success:false,error:"Internal server error"})
}
}


module.exports = {
    cartopen,
    AddToCart,
}