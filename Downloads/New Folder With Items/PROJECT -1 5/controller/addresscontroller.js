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



module.exports = {
    NewAddress,
    addresses,
    postAddress,
}