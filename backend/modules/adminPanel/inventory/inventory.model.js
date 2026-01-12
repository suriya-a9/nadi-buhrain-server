const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: String
    },
    stock: {
        type: Boolean,
        default: true
    },
    price: {
        type: Number
    }
}, { timestamps: true });

const Inventory = mongoose.model("Inventory", inventorySchema);
module.exports = Inventory;