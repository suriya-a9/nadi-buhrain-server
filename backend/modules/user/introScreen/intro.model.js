const mongoose = require("mongoose");

const introSchema = new mongoose.Schema(
  {
    content_en: {
      type: [String],
      required: true,
    },
    content_ar: {
      type: [String]
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