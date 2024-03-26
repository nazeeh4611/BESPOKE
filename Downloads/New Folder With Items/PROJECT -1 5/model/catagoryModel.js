const mongoose = require("mongoose");

const CategoryModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  is_Listed: {
    type: Number,
    default: 0,
  },
  offer:[{
    type:mongoose.Types.ObjectId,
    ref:"offer"
  }]
});

module.exports = mongoose.model("Category", CategoryModel);
