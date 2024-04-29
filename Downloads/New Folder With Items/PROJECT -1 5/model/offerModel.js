const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    startingdate:{
        type:Date,
        required:true,
    },
    discount:{
      type:Number,
      required:true,
    },
    endingdate:{
        type:Date,
        required:true,
    },
    is_Blocked:{
        type:Boolean,
        default:false,
    }
});

module.exports = mongoose.model("offer",OfferSchema);

