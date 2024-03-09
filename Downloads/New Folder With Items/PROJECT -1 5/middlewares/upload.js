// routes/productRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../model/productModel"); // Corrected import path for the product model

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploadImg"));
  },
  filename: (req, file, cb) => {
    const name = Date.now() + "_" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

// Handle form submission
router.post("/addproduct", upload.array("image[]", 4), async (req, res) => {
  try {
    // Extract form data
    const { productName, description, quantity, price, categories } = req.body;

    // Extract file paths of uploaded images
    const imagePaths = req.files.map((file) => file.path);

    // Create a new product object
    const product = new Product({
      name: productName,
      description,
      quantity,
      price,
      categories,
      Image: imagePaths,
      date: Date.now(), // You might want to adjust this based on your requirements
    });

    // Save the product to the database
    await product.save();

    res.status(200).json({ success: true, message: "Product added successfully" });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: "Failed to add product" });
  }
});

module.exports = router;
