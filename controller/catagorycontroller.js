const Categories = require("../model/catagoryModel");
const Offer = require("../model/offerModel");

const loadCategory = async (req, res) => {
  try {
    const Data = await Categories.find();

const offer = await Offer.find({});
    res.render("admin/category", { Data: Data,offer });
  } catch (error) {
    console.log(error.message);
  }
};

const addCategory = async (req, res) => {
  try {
    res.render("admin/addcatagory");
  } catch (error) {
    console.log(error.message);
  }
};

const newCategory = async (req, res) => {
  try {
    const name = req.body.categoryName.toUpperCase();
    const description = req.body.categoryDescription.toUpperCase();

    const category = await Categories.findOne({ name: name });

    if (category) {
      res.render("admin/addcatagory", {
        messages: { message: "This category already exists" },
      });
    } else {
      const newData = new Categories({
        name: name,
        description: description,
      });

      const categoryData = await newData.save();
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const editCategory = async (req, res) => {
  try {
    const categoryId = req.query.id;
   
    const category = await Categories.findOne({ _id: categoryId });

  

    res.render("admin/editcategory", { category });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const editedCategory = async (req, res) => {
  try {
    const categoryid = req.body.categoryid;
    const name = req.body.categoryName;
    const description = req.body.categoryDescription;

    const existingCategory = await Categories.findOne({ name: name });

    if (existingCategory && existingCategory._id.toString() !== categoryid) {
      return res.render("admin/editcategory", {
        category: {},
        messages: { message: "This category already exists" },
      });
    }

    const updatedCategory = await Categories.findByIdAndUpdate(
      categoryid,
      {
        name: name,
        description: description,
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.render("admin/editcategory", {
        category: {},
        messages: { message: "Category not found" },
      });
    }

    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryid = req.query.id;
    await Categories.findByIdAndUpdate({ _id: categoryid },
      {is_Deleted:true});
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

const Listed = async (req, res) => {
  try {
    await Categories.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { is_Listed: 1 } }
    );
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

const UnListed = async (req, res) => {
  try {
    await Categories.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { is_Listed: 0 } }
    );
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCategory,
  addCategory,
  newCategory,
  editCategory,
  editedCategory,
  deleteCategory,
  Listed,
  UnListed,
};
