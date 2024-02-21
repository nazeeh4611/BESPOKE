const adminController = require("../controller/admincontroller");
const categoryController = require("../controller/catagorycontroller");
const productController = require("../controller/productcontroller");
const express = require('express');

const adminRoute = express();
const adminAuth = require("../middlewares/adminAuth")

adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended:true}));


adminRoute.get("/",adminAuth.isLogout,adminController.adminLogin);
adminRoute.post("/",adminAuth.isLogout,adminController.verifyAdminLogin);
adminRoute.get("/dashboard",adminAuth.isLogin,adminController.adminDashboard);
adminRoute.get("/adminlogout",adminController.adminLogout);
adminRoute.get("/users",adminAuth.isLogin,adminController.userManagement);
adminRoute.get("/block",adminAuth.isLogin,adminController.BlockUser);

adminRoute.get("/category",categoryController.loadCategory);
adminRoute.get("/addcategory",categoryController.addCategory);
adminRoute.post("/addcategory",categoryController.newCategory);
adminRoute.get("/editcategory",categoryController.editCategory);
adminRoute.post("/editcategory",categoryController.editedCategory);
adminRoute.get("/deletecategory",categoryController.deleteCategory);
adminRoute.get("/list",categoryController.Listed);
adminRoute.get("/unlist",categoryController.UnListed);
adminRoute.get("/products",productController.loadProduct);
adminRoute.get("/addproduct",productController.loadAddProduct);
adminRoute.get('/');
adminRoute.post('/addproduct',productController.addProduct);
module.exports = adminRoute;
