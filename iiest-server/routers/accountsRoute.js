const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getInvoiceList } = require('../controllers/accountsControllers/accounts');
const { createInvoie } = require('../controllers/coworksControllers/coworks');
const router = express.Router();

//routes

router.get('/getinvoicelist', getInvoiceList); //route for getting invoice list
router.post('/createinvoice', createInvoie); //route for getting invoice list

//exporting router
module.exports = router;