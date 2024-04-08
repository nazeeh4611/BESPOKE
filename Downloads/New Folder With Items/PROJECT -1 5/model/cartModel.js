const mongoose = require("mongoose");

const cartModel = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  offer:[{
    type:mongoose.Types.ObjectId,
    ref:"offer",
  }],
  product: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name:{
        type:String,
        required:true
      },
      price: {
        type: Number,
        default: 0,
      },
      quantity: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
    },
  ],
  coupondiscount:{
    type:mongoose.Types.ObjectId,
    ref:"coupon",
    default:null,
  },
  shippingcharge:{
    type:Number,
    default:100,
  }
});

// Middleware to convert string values to ObjectId

module.exports = mongoose.model("Cart", cartModel);
