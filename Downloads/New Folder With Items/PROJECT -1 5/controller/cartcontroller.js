const Cart = require("../model/cartModel");
const Category = require("../model/catagoryModel");
const User = require("../model/userModel");
const Product = require("../model/productModel");
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

      console.log("subtotal", subtotal);
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

    const productId = req.body.productId; // Corrected variable name
    const productdata = await Product.findById(productId);
    if (!productdata || productdata.quantity === 0) {
      return res.json({
        success: false,
        error: "Product is not found or out of stock",
      });
    }

    // Find if the product already exists in the user's cart
    const existProduct = await Cart.findOne({
      user: userId,
      "product.productId": productId, // Ensure correct property name
    });

    if (existProduct) {
      // If the product exists, increment its quantity
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
      // If the product doesn't exist, add it to the cart
      const cartData = await Cart.findOneAndUpdate(
        { user: userId },
        {
          $set: { user: userId },
          $push: {
            product: {
              productId: productId, // Ensure correct property name
              price: productdata.price,
              quantity: 1,
              total: productdata.price,
            },
          },
        },
        { upsert: true, new: true } // Upsert ensures insertion if document doesn't exist
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

    console.log("lklk", cartData);
    if (count == -1) {
      const currentquantity = cartData.product.find(
        (p) => p.productId == product_id
      ).quantity;
      if (currentquantity <= 1) {
        return res.json({
          success: false,
          error: "quantity cannot be decrease than 1",
        });
      }
    }

    if (count == 1) {
      const currentquantity = cartData.find(
        (p) => product == product_id
      ).quantity;
      if (currentquantity + count > product.quantity) {
        return res.json({
          success: false,
          error: "Cannot be add more than quantity",
        });
      }
    }

    const cartDetail = await Cart.findByIdAndUpdate(
      {
        user: user_id,
        "product.productId": product_id,
      },
      {
        $inc: {
          "product.$quantity": count,
          "product.$total":
            count *
            cartData.product.find((p) => p.productId).equals(product_id).price,
        },
      }
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
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

module.exports = {
  cartopen,
  AddToCart,
  updateCart,
  removecart,
};
