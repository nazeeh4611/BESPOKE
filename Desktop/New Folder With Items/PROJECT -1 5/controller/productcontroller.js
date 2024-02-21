const products = require("../model/productModel");
const Category = require("../model/catagoryModel")
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const mongoose = require("mongoose");

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
        const productData = await Category.find({is_Listed:1});
        res.render("admin/addproduct",{productData})
    } catch (error) {
        console.log(error.message);
    }
}


// adding product
const addProduct = async(req,res)=>{
    try {
        const productDatas = await products.find({name:req.body.productName});
        if(productDatas.length > 0){
            return res.status(404).send("Not found");
        }
            const { productName,description,quantity,categories,price} = req.body;
            const filenames = [];
            const existcategory = await Category.findOne({name:categories})
            const Datas = await Category.find({is_Listed: 1 });

            if(!req.files || req.files.length !==4){
                return res.render("admin/addproduct",
                {message:"you need to add four photos",
                productData:Datas,
            });
            }
            for(let i = 0;i<req.files.length;i++){
                const imgpath = path.join(
                    __dirname,"../public/productImage",
                    req.files[i].filename
                );
                await sharp(req.files[i].path).resize(800,1200,{fit:"fill"})
                .toFile(imgpath);
                filenames.push(req.files[i].filename);
            }
            const newProduct = new products({
                name:productName,
                description,
                quantity,
                price,
                Image:filenames,
                category:existcategory._id,
                date: new Date(),
            });

            await newProduct.save();
            res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const editProduct = async(req,res)=>{
    try {
        const id = req.body.id;
        const {productName,description,quantity,categories,price} = req.body;

        const Datas = await products.findOne({_id:id});
        const productData = Category.find({is_Listed:1});
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

        const selectcategory = await Category.findOne({
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
                category:selectcategory._id,
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




module.exports = {
    loadProduct,
    loadAddProduct,
    addProduct,
    editProduct,
}



  