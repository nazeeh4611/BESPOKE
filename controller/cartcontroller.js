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
        match: { is_Deleted: false },
        populate: [
          { path: 'category', model: 'Category', populate: { path: 'offer' } },
          { path: 'offer' },
        ],
      })
      

      const filteredProducts = cartdata.product.filter(product => product.productId && product.productId.is_Listed); 

     
      let total = 0;
      let discountPercentage = 0
      cartdata.product.forEach((product) => {
        let subtotal = filteredProducts.reduce((acc, val) => acc + val.total, 0);
        let productDiscount = null;
        if (product.productId.offer && product.productId.offer.length > 0) {
          productDiscount = product.productId.offer[0].discount;
        }
        
        let categoryDiscount = null;
        if (product.productId.category && product.productId.category.offer && product.productId.category.offer.length > 0) {
          categoryDiscount = product.productId.category.offer[0].discount;
        }
        
        discountPercentage = Math.max(productDiscount !== null ? productDiscount : 0, categoryDiscount !== null ? categoryDiscount : 0);
        
  
        let offer = 0;
        if(discountPercentage){
         
          total += (product.productId.price * (1 - discountPercentage / 100)).toFixed(2)*product.quantity
        
        }else{
          total += product.productId.price * product.quantity;
        }
       
       
     
      });
     
      let discount =(1 - discountPercentage / 100);
      console.log(discount,"discount")
      subtotal = total;
   
        
      res.render("user/cart", { cartdata: {cartdata, product: filteredProducts }, subtotal, total, user: req.session.userId,discount });
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
    const productdata = await Product.findById(productId).populate({
      path: 'category',
      model: 'Category',
      populate: {
        path: 'offer',
        model: 'offer'
      }
    })
    .populate({
      path: 'offer',
      model: 'offer'
    });

    let productDiscount = null;
    if (productdata.offer && productdata.offer.length > 0) {
      productDiscount = productdata.offer[0].discount;
    }
    
    let categoryDiscount = null;
    if (productdata.category && productdata.category.offer && productdata.category.offer.length > 0) {
      categoryDiscount = productdata.category.offer[0].discount;
    }
    
    discountPercentage = Math.max(productDiscount !== null ? productDiscount : 0, categoryDiscount !== null ? categoryDiscount : 0);
    


    console.log("productData",discountPercentage)
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
    if(discountPercentage){
      let price = (productdata.price*(1 - discountPercentage / 100));
      console.log(price)
    if (existProduct) {
      const updatedCart = await Cart.findOneAndUpdate(
        {
          user: userId,
          "product.productId": productId,
        },
        {
          $inc: { "product.$.quantity": 1 
               , "product.$.total":price,
             
            },
        },
        { new: true }
      );
      return res.json({ success: true, stock: true, updatedCart });
  
  }else {
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
              brand:productdata.brand,
              category:productdata.category,
              total:price,
            
            },
          },
        },
        { upsert: true, new: true }
      );
      return res.json({ success: true, stock: true, cartData });
    }
  }else{
    if (existProduct) {
      const updatedCart = await Cart.findOneAndUpdate(
        {
          user: userId,
          "product.productId": productId,
        },
        {
          $inc: { "product.$.quantity": 1 
               , "product.$.total":productdata.price,
             
            },
        },
        { new: true }
      );
      return res.json({ success: true, stock: true, updatedCart });
  
  }else {
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
              brand:productdata.brand,
              category:productdata.category,
              total:productdata.price,
            
            },
          },
        },
        { upsert: true, new: true }
      );
      return res.json({ success: true, stock: true, cartData });
      }
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

    // Handle decrease in quantity
    if (count == -1) {
      const currentQuantity = cartData.product.find(
        (p) => p.productId == product_id
      ).quantity;
     
      if (currentQuantity <= 1) {
        return res.json({
          success: false,
          error: "Quantity cannot be decreased below 1",
        });
      }
    }

    // Handle increase in quantity
    if (count == 1) {
      const currentQuantity = cartData.product.find(
        (p) => p.productId == product_id
      ).quantity;
    
      if (currentQuantity + count > product.quantity) {
        return res.json({
          success: false,
          error: "Cannot add more than available quantity",
        });
      }
    }

    const updatedCart = await Cart.findOneAndUpdate(
      {
        user: user_id,
        "product.productId": product_id,
      },
      {
        $inc: {
          "product.$.quantity": count,
          "product.$.total": count * 
          cartData.product.find((p) => p.productId.equals(product_id)).price,
        },
      },
      { new: true }
    );
    res.json({ success: true, updatedCart });
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
    
    const user = await User.findOne({_id:userIn});
    const address = await Address.findOne({ user: userIn });
    console.log("user",user.wallet)
    const cartdata = await Cart.findOne({ user: userIn }).populate({
      path: 'product.productId',
      model: 'Product',
      match: {is_Deleted:false},
      populate: [
        { path: 'category', model: 'Category', populate: { path: 'offer' } },
        { path: 'offer' },
      ],
    })
    .populate("coupondiscount");


    if (!cartdata) {
      return res.render("user/404", { messages: { message: "Your cart is empty." } });
    }

    const filteredProducts = cartdata.product.filter(product => product.productId && product.productId.is_Listed); 


    let addresses = address || { address: [] };

    // Calculate subtotal
    let subtotal = 0;
    let total = 0
    if (cartdata && cartdata.product) {
      let discountPercentage = 0

      cartdata.product.forEach((product)=>{
       
          let productDiscount = null;
          if (product.productId.offer && product.productId.offer.length > 0) {
            productDiscount = product.productId.offer[0].discount;
          }
          
          let categoryDiscount = null;
          if (product.productId.category && product.productId.category.offer && product.productId.category.offer.length > 0) {
            categoryDiscount = product.productId.category.offer[0].discount;
          }
          
          discountPercentage = Math.max(productDiscount !== null ? productDiscount : 0, categoryDiscount !== null ? categoryDiscount : 0);
          
        console.log(discountPercentage,"discount")
        if(discountPercentage){
            total += (product.productId.price *(1 - discountPercentage / 100) ) * product.quantity;
          } else {
            total += product.productId.price * product.quantity;
          }
        })
       
      
   subtotal = total;
    }
    const productId = req.body.productId;
    const productdata = await Product.findById(productId);

    const existProduct = await Cart.findOne({
      user: req.session.userId,
      "product.productId": productId,
    });

    const coupon = await Coupon.find({});
   
    
    
    let shippingcharge = 100;

    res.render("user/checkout", {
      cartdata: { cartdata, product: filteredProducts },
      addresses,
      subtotal,
      coupon,
      coupondiscount: cartdata.coupondiscount,
      user, 
      userIn,shippingcharge
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
        match: { is_Listed: true }  
      });
      
      const cartdatas = await Cart.findOne({ user: userId }).populate({
        path: "product.productId",
        model: "Product",
        match: { is_Listed: true }  
      });


      console.log(cartdatas,"the wishlist data")

let filter ;
    if(cartdatas){
     filter = cartdatas
    }

   const cartdata = filter;
   let filteredProducts;
  
     filteredProducts = wishlistdata

      res.render("user/wishlist",{ wishlistdata,user:req.session.userId,cartdatas})
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


     const result = await wishlist.findOneAndUpdate(
          { user: userId },
          {$pull:{ product: { productId: productId } }}, 
          {new:true}
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
