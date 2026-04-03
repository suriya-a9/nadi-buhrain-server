const mongoose = require("mongoose");

const roadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);
const Road = mongoose.model("Road", roadSchema);
module.exports = Road;
