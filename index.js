const mongoose = require("mongoose");

const User = require("./model/userModel");
const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const nocache = require("nocache");
require("dotenv").config();
const passport = require("passport");
mongoose.connect(process.env.MONGODB)

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

const adminRoute = require("./routes/adminroute");
app.use("/admin", adminRoute);

const port = 3009;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Server running on http://localhost:${port}/admin/`);
});

