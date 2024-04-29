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
      const id = req.query._id;
      console.log(id,"id")
      const offer = await Offer.findOne({_id:id});
      console.log("offer name ",offer.name)
     res.render("admin/editoffer",{offer})
    } catch (error) {
      console.log(error)
    }
  }

  const editedoffer = async(req,res)=>{
    try {
      const id = req.body.offerId;
      console.log("offer is",id)
      const {offerName,Discount,startingDate,endingDate} = req.body;
      const edit = await Offer.findByIdAndUpdate(
        {_id:id},
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

// const deleteoffer = async(req,res)=>{
//   try {
//     const id = req.query.id;
//    await Offer.findByIdAndDelete(
//     {_id:id},
//    );
//    res.redirect("/admin/offerlist")
//   } catch (error) {
    
//   }
// }

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
      const id = req.body.id;
      const offers = await Product.findByIdAndUpdate(
         {_id:productId},
        {$pull:{offer:id}},
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
     console.log("1",offerId,"2",catid);
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
      const {catid,id} = req.body;
     
      const offers = await Category.findByIdAndUpdate(
         {_id:catid},
        {$pull:{offer:id}},
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