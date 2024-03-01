const Address = require("../model/addressModel");
const User = require('../model/userModel');
const Product = require('../model/productModel');
const Category = require('../model/catagoryModel');


const NewAddress = async (res,res)=>{
    try {
        
    const userIn = req.session.userId;
    const userid = await User.findOne({_id:req.session.userId});
    res.render("user/add")

    } catch (error) {
        
    }
}