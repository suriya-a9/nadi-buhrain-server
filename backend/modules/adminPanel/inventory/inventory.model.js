const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    productName_en: {
        type: String,
        required: true
    },
    productName_ar: {
        type: String
    },
    quantity: {
        type: String
    },
    stock: {
        type: Boolean,
        default: true
    },
    lowStock: {
        type: Number,
    },
    price: {
        type: Number
    }
}, { timestamps: true });

const Inventory = mongoose.model("Inventory", inventorySchema);
module.exports = Inventory;