const mongoose = require('mongoose');

const productsModel = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    category:{
        type:mongoose.Types.ObjectId,
        ref:"category",
        required:true,
    },
    Image:{
        type:[String],
        required:true,
    },
    price:{
        type:Number,
        required:true,
    
    },
    description:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    },
    date:{
        type:Number,
        required:true,
    },
    is_Listed:{
        type:Boolean,
        required:true,
    },
});

const Product = mongoose.model("Product",productsModel);
module.exports = Product;

