const { findByIdAndUpdate } = require("../model/cartModel");
const Offer = require("../model/offerModel");
const Product = require("../model/productModel")
const Category = require("../model/catagoryModel")

const offeropen = async(req,res)=>{
    try {
  
      const offers = await Offer.find();

      res.render("admin/offer",{offers})
    } catch (error) {
      console.log(error);
    }
  }
  
  const loadaddoffer = async(req,res)=>{
    try {
      res.render("admin/addoffer");
    } catch (error) {
      console.log(error);
    }
  }
  
  const addoffer = async(req,res)=>{
    try {
const offerdata = await Offer.findOne({name:req.body.offerName});

// if(offerdata){
//     res.render("admin/addoffer",{messages:{message:"offer name already exist"}})
// }

      const {offerName,Discount,startingDate,endingDate} = req.body;

                  
                   
                    
  
      const newOffer = new Offer({
        name:offerName,
        discount:Discount,
        startingdate:startingDate,
        endingdate:endingDate,
      })
      newOffer.save();
      res.redirect("/admin/offerlist")
    } catch (error) {
      console.log(error);
    }
  }


  const listoffer = async(req,res)=>{
    try {
     const offerId = req.body.id;
     
         await Offer.updateOne(
            {_id:offerId},
            {$set:{is_Blocked:false}},
         );
         res.redirect("/admin/offerlist")
    } catch (error) {
        console.log(error);
    }
  }

  const unlistoffer = async(req,res)=>{
    try {
        const offerId = req.body.id;
 
        await Offer.updateOne(
            {_id:offerId},
            {$set:{is_Blocked:true}}
        );
        res.redirect("/admin/offerlist")
    } catch (error) {
        console.log(error);
    }
  }

  const editoffer = async(req,res)=>{
    try {
      const offerid = req.query._id;
      const offer = await Offer.findOne({_id:offerid});
     res.render("admin/editoffer",{offer})
    } catch (error) {
      console.log(error)
    }
  }

  const editedoffer = async(req,res)=>{
    try {
      const offerid = req.body.offerId;
      const {offerName,Discount,startingDate,endingDate} = req.body;
      const edit = await Offer.findByIdAndUpdate(
        {_id:offerid},
        {
          name:offerName,
          discount:Discount,
          startingdate:startingDate,
          endingdate:endingDate,
        }
      );
      console.log("edited data ",edit)
      res.redirect("/admin/offerlist")
    } catch (error) {
      console.log(error)
    }
  }



  const applyProductOffer = async(req,res)=>{
    try {
     const {offerId,proid} = req.body;
 
     const offers = await Product.findByIdAndUpdate(
      {_id:proid},
      {$set:{offer:offerId}},
     );
   
     res.json({success:true})
    } catch (error) {
      console.log(error);
    }
  }

   const removeProductOffer = async(req,res)=>{
    try {
      const productId = req.body.proid;
      const offerid = req.body.offerid ;
      console.log(offerid,"offer")
      const offers = await Product.findByIdAndUpdate(
         {_id:productId},
        {$pull:{offer: offerid}},
        {new:true},
      );
   
      res.json({success:true})
    } catch (error) {
      console.log(error);
    }
  }
  
  const applyCategoryOffer = async(req,res)=>{
    try {
     const {offerId,catid} = req.body;
     const offers = await Category.findByIdAndUpdate(
      {_id:catid},
      {$set:{offer:offerId}},
     );
   
     res.json({success:true})
    } catch (error) {
      console.log(error);
    }
  }

   const removeCategoryOffer = async(req,res)=>{
    try {
      const {catid,offerId} = req.body;
     
      const offers = await Category.findByIdAndUpdate(
         {_id:catid},
        {$pull:{offer:offerId}},
        {new:true},
      );
      res.json({success:true})
    } catch (error) {
      console.log(error);
    }
  }
  
  module.exports = {
    offeropen,
    loadaddoffer,
    addoffer,
    listoffer,
    unlistoffer,
    editoffer,
    editedoffer,
    // deleteoffer,
    applyProductOffer,
    removeProductOffer,
    applyCategoryOffer,
    removeCategoryOffer,
  }