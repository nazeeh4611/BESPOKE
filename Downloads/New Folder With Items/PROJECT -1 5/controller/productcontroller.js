const products = require("../model/productModel");
const category = require("../model/catagoryModel");
const Offer = require("../model/offerModel");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const mongoose = require("mongoose");
const { log } = require("console");
const { name } = require("ejs");
const Product = require("../model/productModel");

// load products page
const loadProduct = async (req, res) => {
  try {
    const offers = await Offer.find({});
  
   
    let query = {}; 
    if (req.query.category) {
      query['category'] = req.query.category; 
    }
    const Products = await products.find(query).populate('category')
    const categories = await category.find({});
    const filteredProducts = Products.filter(product=>product.is_Deleted==false);
    res.render("admin/product", {
      Products:filteredProducts,
      offers,
      categories
    });
  } catch (error) {
    console.log(error.message);
  }
};


// load adding product page
const loadAddProduct = async (req, res) => {
  try {
    const productData = await category.find({is_Listed:1});
    res.render("admin/addproduct", { productData });
  } catch (error) {
    console.log(error.message);
  }
};

// adding product

const addProduct = async (req, res) => {
  try {
      console.log('req.body:', req.body);
console.log('req.files:', req.files);
      const {productName,brandName,productDescription,productQuantity,productPrice,productCategory } = req.body;
       console,log(productName,brandName,productDescription,productQuantity,productPrice,productCategory)
       const productImage=req.files.filename
       const imageFiles = req.files.map(file => file.filename);
       console.log('Image File Names:', imageFiles);
       const formdata = req.body.formdata;
       console.log(formdata);
      const existingProduct = await products.findOne({ name: productName });
      if (existingProduct) {
          return res.render("admin/addproduct", {
              productData: await category.find({ is_Listed: 1 }),
              messages: { message: "Product name already exists" }
          });
      }

      const files = req.files || [];
      if (files.length !== 4) {
          return res.render("admin/addproduct", {
              productData: await category.find({ is_Listed: 1 }),
              messages: { message: "You need to upload exactly four images" }
          });
      }

      const filenames = files.map(file => file.filename);

      const existingCategory = await category.findOne({ name: productCategory });
      if (!existingCategory) {
          return res.render("admin/addproduct", {
              productData: await category.find({ is_Listed: 1 }),
              messages: { message: "Invalid category" }
          });
      }

      const newProduct = new products({
          name: productName,
          description:productDescription,
          quantity:productQuantity,
          price:productPrice,
          brand:brandName,
          Image: imageFiles,
          category: existingCategory._id,
          date: new Date(),
      });

      await newProduct.save();
     let data = true
     res.json(data)
  
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const loadeditproduct = async (req, res) => {
  try {
    const id = req.query.productId;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).send("Invalid productId");
    }
    const productData = await category.find({ is_Listed: 1 });
    const Datas = await products.findOne({ _id: id }).populate('category');
    console.log(Datas)
    if (!Datas) {
      res.status(404).send("Product not found");
    }

    const messages = {};
    res.render("admin/editproduct", { productData:productData, Datas, messages });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
};

const editProduct = async (req, res) => {
  try {
    // Destructure request body
    const { productId, productName, productBrand, productCategory, productPrice, productQuantity, productDescription } = req.body;
  console.log(productId,"id")
    // Retrieve new image files from request
    const newImageFiles = req.files.map(file => file.filename);

    // Find the category
    const selectCategory = await category.findOne({
      name: productCategory,
      is_Listed: 1,
    });

    if (!selectCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Find the product
    const productData = await Product.findById(productId);

    if (!productData) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Add new images to the existing image array
    productData.Image.push(...newImageFiles);

    // Update the product details
    productData.name = productName;
    productData.description = productDescription;
    productData.quantity = productQuantity;
    productData.price = productPrice;
    productData.category = selectCategory._id;
    productData.brand = productBrand;

    // Save the updated product
    await productData.save();

    // Respond with success message
    res.json({ success: true });
  } catch (error) {
    console.error('Error occurred:', error.message);
    res.status(500).send('Internal Server Error');
  }
};




const productListed = async (req, res) => {
  try {
    const productId = req.body.id;
    await products.updateOne({ _id: productId }, { $set: { is_Listed: true } });
    res.redirect("/admin/products");
  } catch (error) {
    console.log("Error in list product ", error.message);
    res.status(500).send("Internal server error");
  }
};

const productUnlist = async (req, res) => {
  try {
    const productId = req.body.id;
    await products.updateOne(
      { _id: productId },
      { $set: { is_Listed: false } }
    );
    res.redirect("/admin/products");
  } catch (error) {
    console.log("Error in unlist product", error.message);
    res.status(500).send("Internal server error");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id,"id")
    await products.updateOne(
      { _id: id },
      {$set:{is_Deleted:true}},
      );
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteimage = async (req, res) => {
  try {
    const { img, prdtid } = req.body;
    if (!prdtid) {
      res.status(400).send({ success: false, error: "product is required" });
    }

    const validproductId = mongoose.Types.ObjectId.isValid(prdtid);
    if (!validproductId) {
      return res
        .status(400)
        .send({ success: false, error: "invalid productId" });
    }
    if (!img) {
      res.status(400).send({ message: false, error: "image is required" });
    }

    fs.unlink(path.join(__dirname, "../public/productImage", img), () => {});
    const upd = await products.updateOne({ _id: prdtid }, { $pull: { Image: img } },{new:true});
    console.log(upd,img);
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ success: false, error: "failed to delete image " });
  }
};



module.exports = {
  loadProduct,
  loadAddProduct,
  addProduct,
  loadeditproduct,
  editProduct,
  productListed,
  productUnlist,
  deleteProduct,
  deleteimage,

};
