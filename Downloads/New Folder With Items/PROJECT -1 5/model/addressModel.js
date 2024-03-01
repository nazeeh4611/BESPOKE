const mongoose = require('mongoose')

const addressModel = new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    address:[
        { 
        fname:{
            type:String,
            required:true,
        },
        lname:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        mobile:{
            type:Number,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        pin:{
            type:Number,
            required:true
        }
    
}]
})