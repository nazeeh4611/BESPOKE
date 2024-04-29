const mongoose = require("mongoose");

const wishlistModel = new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true,
    },
    product:[
        {
            productId:{
                type:mongoose.Types.ObjectId,
                ref:"Product",
                required:true,
            },
            name:{
                type:String,
                required:true,
            },
            price:{
                type:Number,
                required:true,
            },
            
        },
    ],
});
module.exports = mongoose.model("wishlist",wishlistModel);