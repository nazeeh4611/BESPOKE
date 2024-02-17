const User = require("../model/userModel");
const bcrypt = require('bcrypt');

// admin login page 

const adminLogin = async(req,res)=>{
    try {
        res.render('admin/adminlogin');
    } catch (error) {
        console.log(error.message);
    }
}


const verifyAdminLogin = async(req,res)=>{
try {
    const userData = await User.findOne({email:req.body.email});
if(userData){
    const passwordmatch = await bcrypt.compare(
        req.body.password,
        userData.password,
    );

    if(passwordmatch){
        req.session.adminId;
        res.redirect('/admin/dashboard');
    } else {
        const messages = "Incorrect email";
        res.render('admin/adminlogin',messages)
    }
} else {
    const messages = "Incorrect Admin email";
    res.render('admin/adminlogin',messages)
}

} catch (error) {
    console.log(error.message);
}

}










module.exports = {
    adminLogin,
    verifyAdminLogin,
}