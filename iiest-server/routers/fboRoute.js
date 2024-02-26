const express = require('express');
const { fboRegister, deleteFbo, editFbo, fboPayment, fboPayReturn, registerdFBOList, saleInvoice } = require('../controllers/fboControllers/fbo');
const { fboFormData, getProductData } = require('../controllers/generalControllers/generalData');
const { addRecipient, addShop, recipientsList, shopsList, showBill } = require('../controllers/fboControllers/recipient');
const { existingFboCash, existingFboPayReturn, existingFboPayPage } = require('../controllers/fboControllers/existingFbo');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const { foscosDocuments } = require('../config/storage');

const eBillStorage = multer.memoryStorage()
const eBillUpload = multer({storage: eBillStorage});

const router = express.Router();

router.get('/salerecipients/:id', authMiddleware, recipientsList); //Router for recipients list for sale
router.get('/saleshops/:id', authMiddleware, shopsList); //Router for shops list for sale
router.get('/allfbolist', authMiddleware, registerdFBOList); //Router for fbo list
router.post('/fboregister/:id', authMiddleware, fboRegister); //Router for FBO registration (cash)
router.post('/fbo-pay-return', fboPayReturn); //To check payment status
router.post('/fbopayment/:id', authMiddleware, fboPayment); //Router for FBO registration (pay page)
router.delete('/deleteFbo/:id', authMiddleware, deleteFbo); //Router for deleting FBO
router.put('/editFbo/:id', authMiddleware, editFbo); //Router for editing FBO data
router.get('/fbogeneraldata', authMiddleware, fboFormData); //Router for general FBO form data
router.get('/getproductdata', authMiddleware, getProductData); //Router for product data
router.post('/fbo/addshop/:id', authMiddleware, foscosDocuments.fields([{ name: 'eBill', maxCount: 1 }, { name: 'ownerPhoto', maxCount: 1 }, { name: 'shopPhoto', maxCount: 1}]), addShop); //Router for adding shop data
router.post('/fbo/addrecipient/:id', authMiddleware, addRecipient); //Router for adding recipient data
router.get('/shop/ebill/:id', authMiddleware, showBill);
router.get('/fbo/invoice/:id', authMiddleware, saleInvoice);
router.post('/existingfbosale/:id', authMiddleware, existingFboCash);
router.post('/existingfbo-paypage/:id', authMiddleware, existingFboPayPage)
router.post('/existingfbo-pay-return', existingFboPayReturn);

module.exports = router;