const mongoose = require("mongoose");

const introSchema = new mongoose.Schema(
  {
    content: {
      type: [String],
      required: true,
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);
const Intro = mongoose.model("Intro", introSchema);
module.exports = Intro;