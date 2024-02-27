const mongoose = require("mongoose");
const {ObjectId} = require("mongodb")

const cartmodel = new mongoose.Schema({
  user:{
    type:ObjectId,
    ref:"User",
    required:true,
  },
  product:[
    {
        productId:{
            type:ObjectId,
            ref:"Product",
            required:true,
        },
        price:{
            type:Number,
            required:true,
        },
        quantity:{
            type:Number,
            required:true,
        },
        total:{
            type:Number,
            required:true,
        }
        
    }
  ]
})


const Cart = mongoose.model("Cart",cartmodel);
module.exports = Cart

