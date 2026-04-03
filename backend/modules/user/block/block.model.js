const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    roads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Road"
    }],
    status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);
const Block = mongoose.model("Block", blockSchema);
module.exports = Block;