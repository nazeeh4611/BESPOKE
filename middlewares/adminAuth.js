const isLogin = async (req, res, next) => {
  try {
    if (req.session.adminId) {
        next()
     
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/adminlogin");
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.adminId) {
      res.redirect("/admin/dashboard");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
};
