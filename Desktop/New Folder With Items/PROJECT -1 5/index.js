const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const nocache = require("nocache");
require("dotenv").config();
require("./auth");
const passport = require("passport");

// ____________ Session Middleware ______________
app.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

// ____________ Passport Middleware ______________
app.use(passport.initialize());
app.use(passport.session()); // <-- Adding passport.session() middleware

// ____________ Google Authentication Routes ______________
app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/google/success',
    failureRedirect: '/auth/google/failure'
  })
);

app.get("/auth/protected", (req, res) => {
  const name = req.user.displayName;
  res.send(`hello ${name}`);
});

// _____________ Set view engine_______________
// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(nocache());

// routes------------------
const userRoute = require("./routes/userroute");
app.use("/", userRoute);

const adminRoute = require("./routes/adminroute")
app.use("/admin", adminRoute);

const port = 3009;
app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
  console.log(`server running on http://localhost:${port}/admin`);
});
