const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/BESPOKE");
const User = require("./model/userModel")
const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const nocache = require("nocache");
require("dotenv").config();
require("./auth");
const passport = require("passport");

// Session Middleware
app.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: false,
  })
);



// facebook Authentication Routes


 



// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(nocache());

// Routes
const userRoute = require("./routes/userroute");
app.use("/", userRoute);

const adminRoute = require("./routes/adminroute")
app.use("/admin", adminRoute);

const port = 3009;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Server running on http://localhost:${port}/admin/`);
});