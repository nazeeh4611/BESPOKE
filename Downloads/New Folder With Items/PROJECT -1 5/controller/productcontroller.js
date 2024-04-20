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
  
   
    let query = {}; // Initialize an empty query object
    if (req.query.category) {
      query['category'] = req.query.category; // Add category filter to the query
    }
    const Products = await products.find(query).populate('category')
    const categories = await category.find({});
    res.render("admin/product", {
      Products,
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
    
    
    const productDatas = await products.findOne({name:req.body.productName });
    const Datas = await category.find({ is_Listed: 1 });
    if (productDatas) {
    res.render('admin/addproduct',{productData: Datas,messages:{message:"Productname already existed"}})
    }
   
    const { productName, description, quantity, categories, price,brand } = req.body;
    const filenames = [];
    const existcategory = await category.findOne({ name: categories });
   

    if (!req.files || req.files.length !== 4) {
      return res.render("admin/addproduct", {
        message: "you need four photos",
        productData: Datas,
      });
    }
    for (let i = 0; i < req.files.length; i++) {
      const imagepath = path.join(
        __dirname,
        "../public/productImage",
        req.files[i].filename
      );
      await sharp(req.files[i].path)
        .resize({ width: 150 }) // Resize the image to a width of 150px
        .toFile(imagepath);
      filenames.push(req.files[i].filename);
    }
    const newproduct = new products({
      name: productName,
      description,
      quantity,
      price,
      Image: filenames,
      category: existcategory._id,
      date: new Date(),
      brand:brand,
    });

    await newproduct.save();
    res.redirect("/admin/products");
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

    const Datas = await products.findOne({ _id: id });

    if (!Datas) {
      res.status(404).send("Product not found");
    }

    const messages = {};
    res.render("admin/editproduct", { productData, Datas, messages });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
};

const editProduct = async (req, res) => {
  try {
    const id = req.body.id;
    const { productName, description, quantity, categories, price, brand } = req.body;
    const Datas = await products.findOne({ _id: id });
    const productData = category.findOne({ is_Listed: 1 });







    const imageData = [];
    if (req.files) {

      const existedImagecount = (await products.findById(id)).Image.length;
      console.log(existedImagecount,"op")
      if (existedImagecount + req.files.length !== 4) {
        // return res.render("admin/editproduct", {
        //   message: "4 images is enough",
        //   productData,
        //   Datas,
        // });
      } else {
        for (let i = 0; i < req.files.length; i++) {
          const resizedpath = path.join(
            __dirname,
            "../public/productImage",
            req.files[i].filename
          );
          await sharp(req.files[i].path)
            .resize(800, 1200, { fit: "fill" })
            .toFile(resizedpath);

          imageData.push(req.files[i].filename);
        }
      }
    }

    const selectcategory = await category.findOne({
      name: categories,
      is_Listed: 1,
    });
    const updteProduct = await products.findByIdAndUpdate(
      id, // Pass the id directly
      {
        name: productName,
        description,
        quantity: quantity,
        price,
        category: selectcategory._id,
        brand: brand,
        $push: { Image: { $each: imageData } },
      },

      {
        new: true,
      }
    );

    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
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

    console.log(img,prdtid,"here")
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
    await products.updateOne({ _id: prdtid }, { $pull: { Image: img } });
    res.send({ message: "image deleted" });
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
