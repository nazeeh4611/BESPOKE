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

const addCoupon = async (req, res) => {
    try {
        const { CouponName, CouponCode, Discount, ExpireDate, Criteria } = req.body;
const currentDate = new Date().toLocaleDateString();

console.log(currentDate,"innathe date")

if (await Coupon.findOne({ name: CouponName })) {
    return res.render("admin/addcoupon", { messages: { message: "Coupon Name already existed" } });
}
if (await Coupon.findOne({ couponcode:CouponCode })) {
    return res.render("admin/addcoupon", { messages: { message: "Coupon code already existed" } });
}
    if(CouponName&& CouponCode&& Discount&& ExpireDate&& Criteria){

            const newCoupon = new Coupon({
                name: CouponName,
                discountamount: Discount,
                couponcode: CouponCode,
                expiredate: ExpireDate,
                criteriaamount: Criteria,
            });
            await newCoupon.save();
            res.redirect("/admin/couponlist");
        }
        else{
            res.render("admin/addcoupon")
        }
    } catch (error) {
        console.log(error);
    }
};

const editcoupon = async (req,res)=>{
    try {
        const couponid = req.query._id;
      
        const coupon = await Coupon.findOne({_id:couponid});
        res.render("admin/editcoupon",{coupon})
    } catch (error) {
        
    }
}

const editedcoupon = async(req,res)=>{
    try {
        const couponid = req.body.couponId;
        const { CouponName, CouponCode, Discount, ExpireDate, Criteria } = req.body;

      
       const updateCoupon = await Coupon.findByIdAndUpdate(
        {_id:couponid},
        {  name: CouponName,
            discountamount: Discount,
            couponcode: CouponCode,
            expiredate: ExpireDate,
            criteriaamount: Criteria,
        }
       );
      res.redirect("/admin/couponlist")
    } catch (error) {
        console.log(error)
    }
}

const deleteCoupon = async(req,res)=>{
    try {
        const couponid = req.query._id;
       
      const after =  await Coupon.findByIdAndDelete(
            {_id:couponid},
         );
    res.redirect("/admin/couponlist")
    } catch (error) {
        console.log(error)
    }
}


const applycoupon = async(req,res)=>{
    try {
        const userId = req.session.userId;
     
    const couponId = req.body.id; 

    const currentDate = new Date();
    const coupondata = await Coupon.findOne({_id:couponId,expiredate:{$gt:currentDate}})


    // exists = coupondata.useduser.includes(userId);
    // console.log(exists,"existing coupon");


//    if(exists || !exists){
   const cartUser = await Cart.findOne({user:userId});
   
   if(cartUser&&cartUser.coupondiscount == null){
    await Coupon.findByIdAndUpdate(
        {_id:couponId},
        // {$push:{useduser:userId}}
    )
  
   const cartcoupon = await Cart.findOneAndUpdate(
    {user:userId},
    {$set:{coupondiscount:coupondata._id}},
   );
   res.json({success:true,coupondata})
   console.log(cartcoupon); 
   }else{
    res.json({status:'Already applied'});
    console.log(res.json,"already apllied");
   }

    // }
    } catch (error) {
        console.log(error);
    }
}

const RemoveCoupon = async(req,res)=>{
    try {
        const couponId = req.body.couponId;
      
         const userId = req.session.userId;
        //  const coupondata = await Coupon.findOneAndUpdate({_id:couponId},{$pull:{useduser:userId}});
         const cartdata = await Cart.findOneAndUpdate({user:userId},{$set:{coupondiscount:null}});
         res.json({success:true});
   
        
  
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
    editcoupon,
    editedcoupon,
    deleteCoupon,
}