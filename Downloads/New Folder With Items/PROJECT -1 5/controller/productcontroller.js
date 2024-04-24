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
      // Extract form data
      console.log('req.body:', req.body);
console.log('req.files:', req.files);
      const {productName,brandName,productDescription,productQuantity,productPrice,productCategory } = req.body;
       console,log(productName,brandName,productDescription,productQuantity,productPrice,productCategory)
       const productImage=req.files.filename
       const imageFiles = req.files.map(file => file.filename);
       console.log('Image File Names:', imageFiles);
       const formdata = req.body.formdata;
       console.log(formdata);
      // Check if the product name already exists
      const existingProduct = await products.findOne({ name: productName });
      if (existingProduct) {
          // Render error if product name already exists
          return res.render("admin/addproduct", {
              productData: await category.find({ is_Listed: 1 }),
              messages: { message: "Product name already exists" }
          });
      }

      // Handle file uploads
      const files = req.files || [];
      if (files.length !== 4) {
          return res.render("admin/addproduct", {
              productData: await category.find({ is_Listed: 1 }),
              messages: { message: "You need to upload exactly four images" }
          });
      }

      // Process image files and collect filenames
      const filenames = files.map(file => file.filename);

      // Find category
      const existingCategory = await category.findOne({ name: productCategory });
      if (!existingCategory) {
          return res.render("admin/addproduct", {
              productData: await category.find({ is_Listed: 1 }),
              messages: { message: "Invalid category" }
          });
      }

      // Create a new product
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

      // Save the new product to the database
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
    console.log(Datas.category.name,"product dat")
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
    const id = req.body.id;
    const { productName, description, quantity, categories, price, brand } = req.body;

    const Datas = await products.findOne({ _id: id });
    const productData = await category.find({ is_Listed: 1 });    
    console.log(productData,"productSata");
    const imageData = [];
    if (req.files) {
   
      const existedImagecount = (await products.findById(id)).Image.length;

      if (existedImagecount + req.files.length !== 4) {
        return res.render("admin/editproduct", {
          message: "4 images needed",
          productData,
          Datas,
        });
      } else {
        for (let i = 0; i < req.files.length; i++) {
          const resizedpath = path.join(
            __dirname,
            "../public/uploadImg",
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
     console.log(selectcategory._id,"ijijijijijijijji")
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
