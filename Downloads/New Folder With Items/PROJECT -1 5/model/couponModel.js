const mongoose = require('mongoose');


const CouponSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    discountamount:{
        type:Number,
        required:true,
    },
    couponcode:{
        type:String,
        required:true,
    },
    expiredate:{
        type:Date,
        required:true,
    },
    criteriaamount:{
        type:String,
        required:true
    },
    useduser:{
        type:Array,
        ref:'User',
        default:[],
    }
});

module.exports = mongoose.model('coupon',CouponSchema);
