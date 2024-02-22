const products = require("../model/productModel");
const category = require("../model/catagoryModel")
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const mongoose = require("mongoose");
const { log } = require("console");


// load products page
const loadProduct = async(req,res)=>{
    try {
        const Products = await products.find({});
        res.render("admin/product",{Products})
    } catch (error) {
         console.log(error.message);
    }
}

// load adding product page
const loadAddProduct = async(req,res)=>{
    try {
        const productData = await category.find({is_Listed:1});
        res.render("admin/addproduct",{productData})
    } catch (error) {
        console.log(error.message);
    }
}



// adding product

    const addProduct = async (req, res) => {
        try {
          const productDatas = await products.find({ name: req.body.productname });
      
          if (productDatas.length > 0) {
            return res.status(404).send("It's already existed");
          }
      
          const { productName, description, quantity, categories, price } = req.body;
          console.log("5",req.body.categories);
          console.log("4",req.body.productName);
          console.log("3",req.body.description);
          console.log("2",req.body.quantity);
          console.log("1",req.body.price);
          const filenames = [];
          const existcategory = await category.findOne({ name: categories });
          const Datas = await category.find({ is_Listed: 1 });
      
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
          });
      
          await newproduct.save();
          res.redirect("/admin/products");
        } catch (error) {
          console.log(error.message);
          res.status(500).send("Internal Server Error");
        }
      };


const editProduct = async(req,res)=>{
    try {
        const id = req.body._id;
        const {productName,description,quantity,categories,price} = req.body;

        const Datas = await products.findOne({_id:id});
        const productData = category.find({is_Listed:1});
        const imageData =[];
        if(req.files){
            const existedImagecount = (await products.findById(id)).Image.length;
            if(existedImagecount + req.files.length !== 4){
                return res.render('admin/editproduct',{
                    message:"4 images is enough",
                    productData,
                    Datas,
                });
            }else{
                for(let i=0;i < req.files.length;i++){
            const resizedpath = path.join(
                __dirname,
            "../public/productImage",
            req.files[i].filename
            );
            await sharp(req.files[i].path)
            .resize(800,1200,{fit:"fill"})
            .toFile(resizedpath);

            imageData.push(req.files[i].filename);
                }
            }
        }

        const selectcategory = await category.findOne({
            name:categories,
            is_Listed:1
        })

        const updteProduct = await products.findByIdAndUpdate(
            {_id:id},
            {
                name:productName,
                description,
                quantity:quantity,
                price,
                categories:selectcategory._id,
                $push:{Image:{$each:imageData}},
            },
            {
                new:true,
            }
        );
        res.redirect("/admin/products")
    } catch (error) {
        console.log((error.message));
    }
}


const productListed = async(req,res)=>{
    try {
        const productId = req.body.id;
        await products.updateOne({_id:productId},{$set:{is_Listed:true}});
        res.redirect("/admin/products");
    } catch (error) {
        console.log("Error in list product ",error.message);
        res.status(500).send("Internal server error")
    }
}

const productUnlist = async(req,res)=>{
    try {
        const productId = req.body.id;
        await products.updateOne({_id:productId},{$set:{is_Listed:false}})
        res.redirect("/admin/products");
    } catch (error) {
        console.log("Error in unlist product",error.message);
        res.status(500).send("Internal server error")
    }
}


const deleteProduct = async(req,res)=>{
    try {
        const id = req.query.id;
        await products.deleteOne({_id:id});
        res.redirect("/admin/products")
    } catch (error) {
        console.log(error.message);
    }
}


const ImageDelete = async(req,res)=>{
    try {
        const {img,prdtid} = req.body;
        if(!prdtid){
            res.status(400).send({success:false,error:"product is required"});
        }

        const validproductId = mongoose.Types.ObjectId.isValid(prdtid);
        if(!validproductId){
            return res.status(400).send({success:false,error:"invalid productId"})
        }
        if(!img){
            res.status(400).send({message:false,error:"image is required"});
        }

        fs.unlink(path.join(__dirname,"../public/productImage",img),()=>{});
        await products.updateOne({_id:prdtid},{$pull:{Image:img}});
        res.send({message:"image deleted"})
    } catch (error) {
        console.log(error.message);
        res.status(500).send({success:false,error:"failed to delete image "})
    }
}

module.exports = {
    loadProduct,
    loadAddProduct,
    addProduct,
    editProduct,
    productListed,
    productUnlist,
    deleteProduct,
    ImageDelete,
}



  