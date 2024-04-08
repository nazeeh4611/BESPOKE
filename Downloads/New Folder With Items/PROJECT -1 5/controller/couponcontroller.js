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

if (ExpireDate < currentDate) {
    return res.render("admin/addcoupon", { messages: { message: "invalid expiredate" } });
}

if (await Coupon.findOne({ name: CouponName })) {
    return res.render("admin/addcoupon", { messages: { message: "Coupon Name already existed" } });
}
if (await Coupon.findOne({ couponcode:CouponCode })) {
    return res.render("admin/addcoupon", { messages: { message: "Coupon code already existed" } });
}
if (Discount > Criteria) {
    return res.render("admin/addcoupon", { messages: { message: "criteria amount must be greater than discount" } });

        } else {
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
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};

const editcoupon = async (req,res)=>{
    try {
        const id = req.query._id;
        console.log("id vannal aayii",id)
      
        const coupon = await Coupon.findOne({_id:id});
        console.log("finded data",coupon);
        res.render("admin/editcoupon",{coupon})
    } catch (error) {
        
    }
}

const editedcoupon = async(req,res)=>{
    try {
        const id = req.body.couponId;
        console.log(id,"id may here")
        const { CouponName, CouponCode, Discount, ExpireDate, Criteria } = req.body;

      
       const updateCoupon = await Coupon.findByIdAndUpdate(
        {_id:id},
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
        const id = req.query._id;
       
      const after =  await Coupon.findByIdAndDelete(
            {_id:id},
         );
    res.redirect("/admin/couponlist")
    } catch (error) {
        console.log(error)
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


   if(exists || !exists){
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
    console.log(res.json,"already apllied");
   }

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
    editcoupon,
    editedcoupon,
    deleteCoupon,
}