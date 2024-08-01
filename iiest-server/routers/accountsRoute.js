const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getInvoiceList } = require('../controllers/accountsControllers/accounts');
const { createInvoie, getCoworkInvoiceList } = require('../controllers/coworksControllers/coworks');
const router = express.Router();

//routes

router.get('/getinvoicelist', authMiddleware, getInvoiceList); //route for getting invoice list
router.post('/createinvoice', authMiddleware, createInvoie); //route for creating coworks invoice
router.get('/getcoworkinvoicelist', authMiddleware, getCoworkInvoiceList) //route for getting cowork invoice list

//exporting router
module.exports = router;