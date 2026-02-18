const Inventory = require('./inventory.model');
const UserLog = require("../../userLogs/userLogs.model");

exports.addInventory = async (req, res, next) => {
    const { productName_ar, productName_en, quantity, stock, price, lowStock } = req.body;
    try {
        await Inventory.create({
            productName_ar,
            productName_en,
            quantity,
            price,
            stock: true,
            lowStock
        });
        await UserLog.create({
            userId: req.user.id,
            log: `${productName_en} product added to inventory`,
            status: "Added",
            role: "admin",
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
        const lang = req.query.lang || "en";
        const productList = await Inventory.find();
        const data = productList.map(item => {
            const obj = item.toObject();
            obj.productName = lang === "ar" ? obj.productName_ar : obj.productName_en;
            delete obj.productName_en;
            delete obj.productName_ar;
            return obj;
        });
        res.status(200).json({
            data
        })
    } catch (err) {
        next(err)
    }
}

exports.listInventoryForAdmin = async (req, res, next) => {
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
            log: `${updatedProduct.productName_en} product details updated`,
            status: "Updated",
            role: "admin",
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
            log: `${deletedProduct.productName_en} product has been removed from inventory`,
            status: "Deleted",
            role: "admin",
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
            log: `${updatedProduct.productName_en} product stock details updated`,
            status: "Updated",
            role: "admin",
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