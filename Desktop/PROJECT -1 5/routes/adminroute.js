const adminController = require("../controller/admincontroller");
const express = require('express');

const adminRoute = express();

adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended:true}));


adminRoute.get("/login",adminController.adminLogin);
adminRoute.post("/login",adminController.verifyAdminLogin);



module.exports = adminRoute;