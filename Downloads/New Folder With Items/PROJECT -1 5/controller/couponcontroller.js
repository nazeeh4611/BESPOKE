const Coupon = require('../model/couponModel');
const User = require('../model/userModel');
const Cart = require("../model/cartModel");
const { findOneAndUpdate } = require('../model/orderModel');



const loadCoupon = async(req,res)=>{
    try {
        const coupon = await Coupon.find({});
        console.log("coupon ",coupon);
        res.render("admin/couponlist",{coupon:coupon})
    } catch (error) {
       console.log(error); 
    }
}

const loadaddcoupon = async(req,res)=>{
    try {
        res.render("admin/addcoupon")
    } catch (error) {
        console.log(error);
    }
}

const addCoupon = async(req,res)=>{
    try {
      const{CouponName,CouponCode,Discount,ActivationDate,ExpireDate,Criteria} =req.body
      console.log(CouponName,"1",CouponCode,"2",Discount,"3",ActivationDate,"4",ExpireDate,"5",Criteria,"6");

      const newCoupon = new Coupon({
        name:CouponName,
        discountamount:Discount,
        couponcode:CouponCode,
        activationdate:ActivationDate,
        expiredate:ExpireDate,
        criteriaamount:Criteria,
      })
      newCoupon.save();
      console.log("all are here",newCoupon);
      res.redirect("/admin/couponlist")
 
    } catch (error) {
     console.log(error);   
    }
}

const applycoupon = async(req,res)=>{
    try {
        const userId = req.session.userId;
        console.log(userId,"userId here");
    const couponId = req.body.id; 
    console.log("couponid here",couponId);

    const currentDate = new Date();
     console.log("current ",currentDate);
    const coupondata = await Coupon.findOne({_id:couponId,expiredate:{$gt:currentDate}})

    console.log(coupondata);

    exists = coupondata.useduser.includes(userId);
    console.log(exists,"existing coupon");


   if(!exists){
   const cartUser = await Cart.findOne({user:userId});
    console.log(cartUser);
   
   if(cartUser&&cartUser.coupondiscount == null){
    await Coupon.findByIdAndUpdate(
        {_id:couponId},
        {$push:{useduser:userId}}
    )
  
   const cartcoupon = await Cart.findOneAndUpdate(
    {user:userId},
    {$set:{coupondiscount:coupondata._id}},
   );
   res.json({success:true,coupondata})
   console.log(cartcoupon); 
   }else{
    res.json({status:'Already applied'});
    console.log(res.json,"already apllie");
   }
}else{
    res.json({status:'Already Used'});
    console.log(res.json,'Already Used');
}
    } catch (error) {
        console.log(error);
    }
}

const RemoveCoupon = async(req,res)=>{
    try {
        const couponId = req.body.couponId;
        console.log("coupon id here",couponId);
      
         const userId = req.session.userId;
       console.log("userId",userId);
         const coupondata = await Coupon.findOneAndUpdate({_id:couponId},{$pull:{useduser:userId}});
         const cartdata = await Cart.findOneAndUpdate({user:userId},{$set:{coupondiscount:null}});
         res.json({success:true});
         console.log(coupondata,"coupondata");
         console.log(cartdata,"cartdata");
        
  
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    loadCoupon,
    loadaddcoupon,
    addCoupon,
    applycoupon,
    RemoveCoupon,
}