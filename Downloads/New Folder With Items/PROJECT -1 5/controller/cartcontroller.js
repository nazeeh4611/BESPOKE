const Cart = require("../model/cartModel");
const Category = require("../model/catagoryModel");
const User = require("../model/userModel");
const Product = require("../model/productModel");
const Address = require("../model/addressModel");
const { Long } = require("mongodb");
const { session } = require("passport");

const cartopen = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (userId) {
      const cartdata = await Cart.findOne({ user: userId }).populate({
        path: "product.productId",
        model: "Product",
      });

      const subtotal = cartdata?.product.reduce(
        (acc, val) => acc + val.total,
        0
      );
      res.render("user/cart", { cartdata, subtotal, user: req.session.userId });
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

    // Check if adding the product will exceed available stock
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

    // Fetch the product and user's cart data
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

    // Update the cart in the database
    const cartDetail = await Cart.findOneAndUpdate(
      {
        user: user_id,
        "product.productId": product_id,
      },
      {
        $inc: {
          "product.$.quantity": count, // Use $ to identify the correct element to update in the array
          "product.$.total": count * product.price, // Calculate the total based on the product's price
        },
      },
      { new: true } // Return the updated document
    );
    res.json({ success: true });
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


const Loadcheckout = async(req,res)=>{
  try {
    const userIn = req.session.userId;

  const address = await Address.findOne({user:userIn});
  const cartdata = await Cart.findOne({user:userIn}).populate({
    path:'product.productId',
    model:'Product'
  })
  

  const addresses = address.address;

  if (cartdata && cartdata.product) {
    subtotal = cartdata.product?.reduce(
      (acc, val) => acc + val.total,
       0
    );
  }
 
  const productId = req.body.productId; // Corrected variable name
  const productdata = await Product.findById(productId);


  const existProduct = await Cart.findOne({
    user: req.session.userId,
    "product.productId": productId, // Ensure correct property name
  });
    res.render("user/checkout",{cartdata,addresses,subtotal})
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  cartopen,
  AddToCart,
  updateCart,
  removecart,
  Loadcheckout
};
