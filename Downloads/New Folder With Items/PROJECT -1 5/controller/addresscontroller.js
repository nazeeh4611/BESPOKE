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


const postAddress = async (req, res) => {
    try {
        const userData = await User.findOne({_id: req.session.userId});
        const {firstName, lastName, mobileNumber, email, address, city, postCode, isDefault} = req.body;
        const userIn = req.session.userId;

        if (userData) {
            const Data = await Address.findOneAndUpdate(
                {user: userIn},
                {
                    $push: {
                        address: {
                            fname: firstName,
                            lname: lastName,
                            city: city,
                            mobile: mobileNumber,
                            email: email,
                            address: address,
                            pin: postCode,
                        },
                    }
                },
                {new: true, upsert: true}
            )
            console.log("address here", Data);
            // Redirect to the address page after successfully adding the address
            res.redirect('/address'); // Change '/address' to the actual route of your address page
        } else {
            res.render("user/addaddress", {userIn}); // Sending HTML response
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error: "Internal Server Error"}); // Handle error with proper status and JSON response
    }
}




// editAddress function
const editAddress = async (req, res) => {
    try {
        const { id, addressFname, addressLname, addressValue, addressCity, addressEmail, addressPost, addressNumber } = req.body;

        // Find the address by its id
        const user = await Address.findOne({ user: req.session.userId });

        const address = user.address.find(
            address => address._id.toString() === id
          );

        // Update address fields

                address.fname = addressFname;
                address.lname = addressLname;
                address.address = addressValue;
                address.city = addressCity;
                address.email = addressEmail;
                address.mobile = addressNumber;
                address.pin = addressPost;

        // Save the changes
        await user.save();

        // Send success response
        res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



const deleteAddress = async (req, res) => {
    try {
        const { id } = req.body;
        console.log("Deleting address with id:", id);
        

        const userAddress = await Address.updateOne(
            { user: req.session.userId },
            { $pull: { address: { _id: id } } },
            { new: true }
        );

        // Send success response
        res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



module.exports = {
    NewAddress,
    addresses,
    postAddress,
    editAddress,
    deleteAddress
}