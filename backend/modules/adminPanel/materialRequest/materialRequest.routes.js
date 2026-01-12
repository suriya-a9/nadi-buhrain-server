const { singleRequest, bulkRequest, responseMaterialRequest, productTechnicians, listMaterialRequests, listSpareParts } = require('./materialRequest.controller');
const auth = require('../../../middleware/authMiddleware');

const express = require('express');

const router = express.Router();

router.post('/single-request', auth, singleRequest);
router.post('/bulk-request', auth, bulkRequest);
router.post('/request-status', auth, responseMaterialRequest);
router.get('/product-technicians/:productId', productTechnicians);
router.get('/', listMaterialRequests);
router.get('/spare-parts', listSpareParts);

module.exports = router;