const mongoose = require("mongoose");

function refcodegenarate(){
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  const length = 8;
  let referalcode = '';
  for(let i=0;i<length;i++){
    referalcode+= characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return referalcode;
}

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
      description:{
        type:String
      },
      Date:{
        type:Date,
      },
  }],
  referalcode:{
    type:String,
    unique:true
  },
  referalby:{
    type:mongoose.Types.ObjectId,
    ref:"User"
  }
},
{ timestamps:true });

userSchema.pre('save', function(next){
  if(!this.referalcode){
    this.referalcode = refcodegenarate();
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
