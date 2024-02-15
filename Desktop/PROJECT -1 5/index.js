const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/BESPOKE");

const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const nocache = require("nocache");
require("dotenv").config();
const port = 3009;

// _____________ set view engine_______________

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(nocache());

// ____________session______________

app.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

const userRoute = require("./routes/userroute");
app.use("/", userRoute);

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
