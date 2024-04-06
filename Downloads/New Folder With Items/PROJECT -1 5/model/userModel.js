const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  is_Verified: {
    type: Number,
    default: 0,
  },
  token: {
    type: String,
    default: "",
  },
  is_Admin: {
    type: Number,
    default: 0,
  },
  is_Blocked: {
    type: Number,
    default: 0,
  },
  google: {
    type: Boolean,
  },
  facebook: {
    type: Boolean,
  },
  wallet:{
    type:Number,
    default:0,
  },
  wallethistory:[{
      amount:{
        type:Number,
        default:0
      },
      discription:{
        type:String
      },
      Date:{
        type:Date,
      },
  }],
});

module.exports = mongoose.model("User", userSchema);
