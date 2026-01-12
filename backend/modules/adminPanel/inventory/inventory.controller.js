const Inventory = require('./inventory.model');
const UserLog = require("../../userLogs/userLogs.model");

exports.addInventory = async (req, res, next) => {
    const { productName, quantity, stock, price } = req.body;
    try {
        await Inventory.create({
            productName,
            quantity,
            price,
            stock: true
        });
        await UserLog.create({
            userId: req.user.id,
            log: `${productName} product added to inventory`,
            status: "Added",
            logo: "/assets/product-added.webp",
            time: new Date()
        });
        res.status(201).json({
            message: "Product created successfully"
        });
    } catch (err) {
        next(err);
    }
}

exports.listInventory = async (req, res, next) => {
    try {
        const productList = await Inventory.find();
        res.status(200).json({
            data: productList
        })
    } catch (err) {
        next(err)
    }
}

exports.updateInventory = async (req, res, next) => {
    const { id, ...updateFields } = req.body;
    try {
        const updatedProduct = await Inventory.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        )
        await UserLog.create({
            userId: req.user.id,
            log: `${updatedProduct.productName} product details updated`,
            status: "Updated",
            logo: "/assets/product-added.webp",
            time: new Date()
        })
        res.status(200).json({
            message: "updated successfully"
        })
    } catch (err) {
        next(err);
    }
}

exports.deleteInventory = async (req, res, next) => {
    const { id } = req.body;
    try {
        const deletedProduct = await Inventory.findByIdAndDelete(id);
        await UserLog.create({
            userId: req.user.id,
            log: `${deletedProduct.productName} product has been removed from inventory`,
            status: "Deleted",
            logo: "/assets/product-added.webp",
            time: new Date()
        })
        res.status(200).json({
            message: "Deleted Successfully"
        })
    } catch (err) {
        next(err);
    }
}

exports.stockUpdate = async (req, res, next) => {
    const { id, stock } = req.body;
    try {
        const updatedProduct = await Inventory.findByIdAndUpdate(
            id,
            { stock: stock },
            { new: true }
        );
        await UserLog.create({
            userId: req.user.id,
            log: `${updatedProduct.productName} product stock details updated`,
            status: "Updated",
            logo: "/assets/product-added.webp",
            time: new Date()
        })
        res.status(200).json({
            message: "Stock updated successfully"
        })
    } catch (err) {
        next(err);
    }
}