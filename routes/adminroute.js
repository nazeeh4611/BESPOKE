const adminController = require("../controller/admincontroller");
const categoryController = require("../controller/catagorycontroller");
const productController = require("../controller/productcontroller");
const offerController = require("../controller/offercontroller");
const couponcontroller = require("../controller/couponcontroller");

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
adminRoute.post("/addcategory",adminAuth.isLogin,categoryController.newCategory);
adminRoute.get("/editcategory", adminAuth.isLogin,categoryController.editCategory);
adminRoute.post("/editcategory",adminAuth.isLogin, categoryController.editedCategory);
adminRoute.get(
  "/deletecategory",adminAuth.isLogin,
 
  categoryController.deleteCategory
);
adminRoute.get("/list",  categoryController.Listed);
adminRoute.get("/unlist",  categoryController.UnListed);
adminRoute.get("/products",adminAuth.isLogin,productController.loadProduct);

adminRoute.get(
  "/addproduct",adminAuth.isLogin,
  productController.loadAddProduct
);

adminRoute.post(
  "/addproduct",adminAuth.isLogin,
  upload.uploadSingle,
  productController.addProduct
);
adminRoute.get(
  "/editproduct",adminAuth.isLogin,

  productController.loadeditproduct
);
adminRoute.post(
  "/editproduct",adminAuth.isLogin,

  upload.uploadSingle,
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
adminRoute.get(
  "/deleteproduct",adminAuth.isLogin,

  productController.deleteProduct
);
adminRoute.delete(
  "/deleteimage",

  productController.deleteimage
);

adminRoute.get("/orderlist",adminAuth.isLogin,
adminController.orderlist);

adminRoute.get('/orders', adminAuth.isLogin, adminController.orderDetails);

  adminRoute.post(
    "/orders",adminAuth.isLogin,
    adminController.orderDetails
    );

adminRoute.patch(
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

adminRoute.get(
  "/offerlist",adminAuth.isLogin,
  offerController.offeropen
);

adminRoute.get(
  "/addoffer",adminAuth.isLogin,
  offerController.loadaddoffer
  );

  adminRoute.post(
    "/addoffer",adminAuth.isLogin,
    offerController.addoffer
  );

  adminRoute.post(
    "/listoffer",
    offerController.listoffer
  );

  adminRoute.post(
    "/unlistoffer",
    offerController.unlistoffer
  );

  adminRoute.get(
    "/editoffer",adminAuth.isLogin,
    offerController.editoffer
  );

  adminRoute.post(
    "/editoffer",adminAuth.isLogin,
    offerController.editedoffer
  );

  // adminRoute.get(
  //   "/deleteoffer",
  //   offerController.deleteoffer
  // );

  adminRoute.post(
    "/applyproductoffer",
    offerController.applyProductOffer
  );

  adminRoute.delete(
    "/removeproductoffer",
    offerController.removeProductOffer
  );

  adminRoute.post(
    "/applycategoryoffer",
    offerController.applyCategoryOffer
  );

  adminRoute.delete(
    "/removecategoryoffer",
    offerController.removeCategoryOffer
  );

  adminRoute.get(
    "/couponlist",adminAuth.isLogin,
  couponcontroller.loadCoupon
  );

  adminRoute.get(
    "/addcoupon",adminAuth.isLogin,
    couponcontroller.loadaddcoupon
  );

  adminRoute.post(
    "/addcoupon",adminAuth.isLogin,
    couponcontroller.addCoupon
  );
  
  adminRoute.get(
    "/editcoupon",
  couponcontroller.editcoupon
  );

  adminRoute.post(
    "/editcoupon",
    couponcontroller.editedcoupon
  );

  adminRoute.get(
    "/deletecoupon",
    couponcontroller.deleteCoupon
  ); 
  adminRoute.get(
    "/sales",adminAuth.isLogin,
    adminController.salesReport
  );

  adminRoute.post(
    "/sales",adminAuth.isLogin,
    adminController.filterSales
  );



module.exports = adminRoute;
