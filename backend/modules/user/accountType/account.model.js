const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    name_ar: {
      type: String,
      required: true,
    },
    name_en: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
