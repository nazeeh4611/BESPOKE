const Cart = require("../model/cartModel");
const Category = require("../model/catagoryModel");
const User = require("../model/userModel");
const Product = require("../model/productModel");
const Address = require("../model/addressModel");
const wishlist = require("../model/wishlistModel");
const Coupon = require('../model/couponModel')
const { Long } = require("mongodb");
const { session } = require("passport");
const { success } = require("./authController");

const cartopen = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (userId) {
      const cartdata = await Cart.findOne({ user: userId }).populate({
        path: "product.productId",
        model: "Product",
        match: { is_Deleted: false }
      });

      const filteredProducts = cartdata.product.filter(product => product.productId && product.productId.is_Listed); 

      const subtotal = filteredProducts.reduce((acc, val) => acc + val.total, 0);

      res.render("user/cart", { cartdata: {cartdata, product: filteredProducts }, subtotal, user: req.session.userId });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};



const AddToCart = async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      return res.json({ session: false, error: "Please login" });
    }

    const userdata = await User.findOne({ _id: userId });
    if (!userdata) {
      return res.json({ session: false, error: "User not found" });
    }

    const productId = req.body.productId;
    const productdata = await Product.findById(productId);
    if (!productdata || productdata.quantity === 0) {
      return res.json({
        success: false,
        error: "Product is not found or out of stock",
      });
    }

    const existProduct = await Cart.findOne({
      user: userId,
      "product.productId": productId,
    });
    if (existProduct) {
      const currentQuantity = existProduct.product.find(
        (p) => p.productId == productId
      ).quantity;
      if (currentQuantity + 1 > productdata.quantity) {
        return res.json({
          success: false,
          error: "Cannot add more than available quantity",
        });
      }
      if(currentQuantity+1 > 5){
        return res.json({
          success:false,
          error:"Cannot add more than 5 units"
        });
      }
    }
    if (existProduct) {
      const updatedCart = await Cart.findOneAndUpdate(
        {
          user: userId,
          "product.productId": productId,
        },
        {
          $inc: { "product.$.quantity": 1 },
        },
        { new: true }
      );
      return res.json({ success: true, stock: true, updatedCart });
    } else {
      const cartData = await Cart.findOneAndUpdate(
        { user: userId },
        {
          $set: { user: userId },
          $push: {
            product: {
              productId: productId, 
              name: productdata.name,
              price: productdata.price,
              quantity: 1,
              total: productdata.price,
            },
          },
        },
        { upsert: true, new: true }
      );
      return res.json({ success: true, stock: true, cartData });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


const updateCart = async (req, res) => {
  try {
    const product_id = req.body.productId;
    const user_id = req.session.userId;
    const count = req.body.count;

    const product = await Product.findOne({ _id: product_id });
    const cartData = await Cart.findOne({ user: user_id });

    // Find the index of the product in the cart
    const productIndex = cartData.product.findIndex(
      (p) => p.productId == product_id
    );

    // Update quantity and recalculate total price
    const updatedQuantity = cartData.product[productIndex].quantity + count;
    if (updatedQuantity <= 0) {
      // Remove the product from the cart if the quantity becomes zero
      cartData.product.splice(productIndex, 1);
    } else {
      // Update quantity and total price
      cartData.product[productIndex].quantity = updatedQuantity;
      cartData.product[productIndex].total = updatedQuantity * product.price;
    }

    // Recalculate subtotal
    let subtotal = 0;
    cartData.product.forEach((item) => {
      subtotal += item.total;
    });

    // Update the cart and subtotal in the database
    await cartData.save();

    res.json({ success: true, subtotal: subtotal });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};




const removecart = async (req, res) => {
  try {
    const product_id = req.body.productId;
    const user_id = req.session.userId;

    const result = await Cart.findOneAndUpdate(
      { user: user_id },
      { $pull: { product: { productId: product_id } } },
      { new: true }
    );

    if (result) {
      res.json({ success: true });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Product not found in cart." });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


const Loadcheckout = async (req, res) => {
  try {
    const userIn = req.session.userId;

    const address = await Address.findOne({ user: userIn });
    const cartdata = await Cart.findOne({ user: userIn }).populate({
      path: 'product.productId',
      model: 'Product',
      match: {is_Deleted:false},
    });

    if (!cartdata) {
      return res.render("user/404", { messages: { message: "Your cart is empty." } });
    }

    const filteredProducts = cartdata.product.filter(product => product.productId && product.productId.is_Listed); 


    let addresses = address || { address: [] };

    // Calculate subtotal
    let subtotal = 0;
    if (cartdata && cartdata.product) {
      subtotal = cartdata.product.reduce((acc, val) => acc + val.total, 0);
    }

    const productId = req.body.productId;
    const productdata = await Product.findById(productId);

    const existProduct = await Cart.findOne({
      user: req.session.userId,
      "product.productId": productId,
    });

    const coupon = await Coupon.find({});

    res.render("user/checkout", {
      cartdata: { cartdata, product: filteredProducts },
      addresses,
      subtotal,
      coupon
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
}



const loadwishlist = async(req,res)=>{
  try {
     const userId = req.session.userId;
     
     if (userId) {
      const wishlistdata = await wishlist.findOne({ user: userId }).populate({
        path: "product.productId",
        model: "Product",
      });
      
    const cartdata = await Cart.findOne({ user: userId }).populate({
      path: "product.productId",
      model: "Product",
    });



      const filteredProducts = cartdata.product.filter(product => product.productId.is_Listed);

      res.render("user/wishlist",{ wishlistdata,user:req.session.userId,cartdata:{cartdata, product: filteredProducts }, })
    }  else{
      res.redirect('login')
    }
  } catch (error) {
    console.log(error);
  }
}

const postwishlist = async (req, res) => {
  try {
    const userId = req.session.userId;


    if (!userId) {
      return res.json({ success: false, error: "Please login" });
    }

   
    const userData = await User.findById(userId);
   
    if (!userData) {
      return res.json({ success: false, error: "User not found" });
    }

 
    const { productId } = req.body;

    const productData = await Product.findById(productId);

    if (!productData) {
      return res.json({ success: false, error: `Product with ID ${productId} not found` });
    }

    const existProduct = await wishlist.findOne({
      user: userId,
      "product.productId": productId,
    });

    if (existProduct) {
      return res.json({
        success: false,
        error: "This item already exists in the wishlist",
      });
    } else {
      const wishlistData = await wishlist.findOneAndUpdate(
        { user: userId },
        {
          $set: { user: userId },
          $push: {
            product: {
              productId: productId,
              name: productData.name,
              price: productData.price,
            },
          },
        },
        { upsert: true, new: true }
      );


      return res.json({ success: true, wishlistData });
    }
  } catch (error) {
    console.log(error.message);
      
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};


const removefromwishlist = async (req, res) => {
  try {
      const userId = req.session.userId;
      const productId = req.body.productId;


      const result = await wishlist.findOneAndDelete(
          { user: userId },
          { product: { productId: productId } }, 
      );

      if (result) {
          res.json({ success: true, result });
      } else {
          res.status(404).json({ success: false, message: "Product not found in wishlist." });
      }
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  cartopen,
  AddToCart,
  updateCart,
  removecart,
  Loadcheckout,
  loadwishlist,
  postwishlist,
  removefromwishlist,
};
