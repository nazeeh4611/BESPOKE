const Address = require("../model/addressModel");
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Category = require('../model/catagoryModel');


const addresses = async (req,res)=>{
    try {
        const userIn= req.session.userId;
        const userId = await User.findOne({_id:req.session.userId})
        const useraddress = await Address.findOne({user:req.session.userId})
        res.render("user/addresses",{userIn,useraddress});
    } catch (error) {
        console.log(error.message);
    }
}

const NewAddress = async(req,res)=>{
    try {
       const userIn = req.session.userId;
       res.render('user/addaddress') 
    } catch (error) {
        console.log(error.message);
    }
}


const postAddress = async (req,res)=>{
    try {
    const userData = await User.findOne({_id:req.session.userId});
    const {fname,lname,mobile,email,address,city,pin}=req.body;
    const userIn = req.session.userId;

    if(userData){
        const Data = await Address.findOneAndUpdate(
            {user:userIn},
            {
              $push:{
                address:{
                fname:fname,
                lname:lname,
                city:city,
                mobile:mobile,
                email:email,
                address:address,
                pin:pin,
            },
        }
    },
    {new:true,upsert:true}
 )
 console.log("address here",Data);
   res.redirect('/address')
 }else{
    res.render("user/addaddress",{userIn});

 }
    } catch (error) {
        console.log(error.message);
    }
}

const editAddress = async(req,res)=>{
    try {
        const {id,addressFname,addressLname,addressValue,addressCity,addressEmail,addressPost,addressNumber}= req.body
        const userId = await User.findOne({_id:req.session.userId})
        const address=  await Address.find(address=>
            address._id.toString()===id
        );
        address.fname = addressFname;
        address.lname = addressLname;
        address.address = addressValue;
        address.email = addressEmail;
        address.city = addressCity;
        address.pin = addressPost;
        address.mobile = addressNumber;
        await userId.save();
        res.status(200).json({success:true});

    } catch (error) {
        res.status(500).json({error:'internal server error'})
    }
}

const deleteAddress = async(req,res)=>{
    try {
       const {id}=req.body;
       const address = await Address.findByIdAndUpdate(
        {userId:req.session.userId},
        {$pull:{address:{_id:id}}},
        {new:true},
       );
       res.status(200).json({success:true}) 
    } catch (error) {
       res.status(500).json({error:"Internak server error"}) 
    }
}


module.exports = {
    NewAddress,
    addresses,
    postAddress,
    editAddress,
    deleteAddress
}