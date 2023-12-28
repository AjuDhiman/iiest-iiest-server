const express = require('express');
const { fboRegister, allFBOData, deleteFbo, editFbo, fboPayment, fboPayReturn } = require('../controllers/fbo');
const { fboFormData, getProductData } = require('../controllers/generalData');
const { addRecipient, addShop } = require('../controllers/recipient');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

const eBillStorage = multer.memoryStorage()
const eBillUpload = multer({storage: eBillStorage});

const router = express.Router();

router.get('/allfbodata', authMiddleware, allFBOData); // Router for registered FBO Data
router.post('/fboregister/:id', authMiddleware, fboRegister); //Router for FBO registration (cash)
router.post('/fbo-pay-return', fboPayReturn); //To check payment status
router.post('/fbopayment/:id', authMiddleware, fboPayment); //Router for FBO registration (pay page)
router.delete('/deleteFbo/:id', authMiddleware, deleteFbo); //Router for deleting FBO
router.put('/editFbo/:id', authMiddleware, editFbo); //Router for editing FBO data
router.get('/fbogeneraldata', authMiddleware, fboFormData); //Router for general FBO form data
router.get('/getproductdata', authMiddleware, getProductData); //Router for product data
router.post('/fbo/addshop/:id', eBillUpload.single('eBill'), addShop); //Router for adding shop data
router.post('/fbo/addrecipient/:id', addRecipient); //Router for adding recipient data

module.exports = router;