const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getInvoiceList, reSendInvoice, reCreateInvoice } = require('../controllers/accountsControllers/accounts');
const { createInvoie, getCoworkInvoiceList, updateRecivingInfo, getCoworkInvoice } = require('../controllers/coworksControllers/coworks');
const router = express.Router();

//routes

router.get('/getinvoicelist', authMiddleware, getInvoiceList); //route for getting invoice list
router.post('/createinvoice', authMiddleware, createInvoie); //route for creating coworks invoice
router.get('/getcoworkinvoicelist', authMiddleware, getCoworkInvoiceList) //route for getting cowork invoice list
router.post('/updatereceivinginfo/:id', authMiddleware, updateRecivingInfo)// route for updating reciving info and sending invoie to client of coworks
router.post('/resendinvoice', authMiddleware, reSendInvoice)// route for resending invoice
router.post('/recreateinvoice/:id', authMiddleware, reCreateInvoice)// route for recreating invoice
router.get('/getcoworkinvoice/:id', authMiddleware, getCoworkInvoice)// route for getting cowork invoice src

//exporting router
module.exports = router;