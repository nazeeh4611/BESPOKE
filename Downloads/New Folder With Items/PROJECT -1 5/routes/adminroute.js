const adminController = require("../controller/admincontroller");
const categoryController = require("../controller/catagorycontroller");
const productController = require("../controller/productcontroller");
const express = require("express");
const upload = require("../middlewares/upload");

const adminRoute = express();
const adminAuth = require("../middlewares/adminAuth");

adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }));

adminRoute.get("/",adminAuth.isLogout,adminController.adminLogin);
adminRoute.post("/",adminController.verifyAdminLogin);
adminRoute.get("/adminLogout",adminAuth.isLogin,adminController.adminLogout);
adminRoute.get("/dashboard",adminAuth.isLogin,adminController.adminDashboard);
adminRoute.get("/adminlogout", adminController.adminLogout);
adminRoute.get("/users",adminAuth.isLogin,adminController.userManagement);
adminRoute.get("/block",adminController.BlockUser);

adminRoute.get("/category",adminAuth.isLogin,categoryController.loadCategory);
adminRoute.get("/addcategory",adminAuth.isLogin,categoryController.addCategory);
adminRoute.post("/addcategory", categoryController.newCategory);
adminRoute.get("/editcategory", categoryController.editCategory);
adminRoute.post("/editcategory", categoryController.editedCategory);
adminRoute.get(
  "/deletecategory",
 
  categoryController.deleteCategory
);
adminRoute.get("/list",  categoryController.Listed);
adminRoute.get("/unlist",  categoryController.UnListed);
adminRoute.get("/products", productController.loadProduct);
adminRoute.get(
  "/addproduct",
 
  productController.loadAddProduct
);

adminRoute.post(
  "/addproduct",adminAuth.isLogin,
  upload.upload.array("image", 4), 
  productController.addProduct
);
adminRoute.get(
  "/editproduct",adminAuth.isLogin,

  productController.loadeditproduct
);
adminRoute.post(
  "/editproduct",

  upload.upload.array("image", 4),
  productController.editProduct
);
adminRoute.post(
  "/listproduct",

  productController.productListed
);
adminRoute.post(
  "/unlistproduct",

  productController.productUnlist
);
adminRoute.delete(
  "/deleteproduct",adminAuth.isLogin,

  productController.deleteProduct
);
adminRoute.delete(
  "/deleteimage",

  productController.deleteimage
);

adminRoute.get(
  "/orders",adminAuth.isLogin,
  adminController.orderlist
  );

adminRoute.get(
  "/orderstatus",adminAuth.isLogin,
  adminController.orderstatus
);

adminRoute.get(
  "/ordercancel",
  adminController.ordercancel
);

adminRoute.get(
  "/orderdelivered",
  adminController.orderdelivered
);


module.exports = adminRoute;
