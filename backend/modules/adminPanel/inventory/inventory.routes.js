const { addInventory, listInventory, updateInventory, deleteInventory, stockUpdate, listInventoryForAdmin } = require('./inventory.controller');
const auth = require('../../../middleware/authMiddleware');

const express = require('express');
const router = express.Router();

router.post('/add-products', auth, addInventory);
router.get('/product-list', listInventory);
router.get('/', listInventoryForAdmin);
router.post('/update-products', auth, updateInventory);
router.post('/delete-products', auth, deleteInventory);
router.post('/stock-update', auth, stockUpdate);
module.exports = router;