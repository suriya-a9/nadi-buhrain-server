const mongoose = require("mongoose");

const roadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Road = mongoose.model("Road", roadSchema);
module.exports = Road;
