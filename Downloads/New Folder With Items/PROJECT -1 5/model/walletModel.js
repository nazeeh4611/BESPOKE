const mongoose = require('mongoose');

const walletModel = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    amount:{
        type:Number,
        default:0,
    },
    discription:{
        type:String,
    },
    Date:{
        type:Date,
    },
    total:{
        type:String,
    },
})

module.exports = mongoose.model("Wallet",walletModel);