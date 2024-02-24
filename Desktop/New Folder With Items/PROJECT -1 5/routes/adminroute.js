const adminController = require("../controller/admincontroller");
const categoryController = require("../controller/catagorycontroller");
const productController = require("../controller/productcontroller");
const express = require('express');
const upload = require("../middlewares/upload")

const adminRoute = express();
const adminAuth = require("../middlewares/adminAuth")

adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended:true}));


adminRoute.get("/",adminAuth.isLogout,adminController.adminLogin);
adminRoute.post("/",adminAuth.isLogout,adminController.verifyAdminLogin);
adminRoute.get("/adminLogout",adminAuth.isLogout,adminController.adminLogout)
adminRoute.get("/dashboard",adminAuth.isLogin,adminController.adminDashboard);
adminRoute.get("/adminlogout",adminController.adminLogout);
adminRoute.get("/users",adminAuth.isLogin,adminController.userManagement);
adminRoute.get("/block",adminAuth.isLogin,adminController.BlockUser);

adminRoute.get("/category",adminAuth.isLogin,categoryController.loadCategory);
adminRoute.get("/addcategory",categoryController.addCategory);
adminRoute.post("/addcategory",categoryController.newCategory);
adminRoute.get("/editcategory",categoryController.editCategory);
adminRoute.post("/editcategory",categoryController.editedCategory);
adminRoute.get("/deletecategory",adminAuth.isLogin,categoryController.deleteCategory);
adminRoute.get("/list",adminAuth.isLogin,categoryController.Listed);
adminRoute.get("/unlist",adminAuth.isLogin,categoryController.UnListed);
adminRoute.get("/products",adminAuth.isLogin,productController.loadProduct);
adminRoute.get("/addproduct",adminAuth.isLogin,productController.loadAddProduct);

adminRoute.post("/addproduct",adminAuth.isLogin,upload.upload.array('image',4),productController.addProduct);
adminRoute.get("/editproduct",adminAuth.isLogin,productController.loadeditproduct)
adminRoute.post("/editproduct",adminAuth.isLogin,upload.upload.array('image',4),productController.editProduct);
adminRoute.post("/listproduct",adminAuth.isLogin,productController.productListed);
adminRoute.post("/unlistproduct",adminAuth.isLogin,productController.productUnlist);
adminRoute.delete("/deleteproduct",adminAuth.isLogin,productController.deleteProduct);
adminRoute.delete("/deleteimage",adminAuth.isLogin,productController.deleteimage)





module.exports = adminRoute;
