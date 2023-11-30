const express = require('express');
const { fboFormValidation } = require('../validation/fboValidation');
const { fboRegister, allFBOData, deleteFbo, editFbo, fboPayment, fboPayReturn } = require('../controllers/fbo');
const { fboFormData } = require('../controllers/generalData');
const { addRecipient } = require('../controllers/recipient');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

const eBillStorage = multer.memoryStorage()
const eBillUpload = multer({storage: eBillStorage});

const router = express.Router();

router.get('/allfbodata', authMiddleware, allFBOData); // Router for registered FBO Data
router.post('/fboregister', authMiddleware, fboFormValidation, fboRegister); //Router for FBO registration form
router.post('/fbo-pay-return', fboPayReturn); //To check payment status
router.post('/fbopayment', authMiddleware, fboPayment);
router.delete('/deleteFbo/:id', authMiddleware, deleteFbo); //Router for deleting FBO
router.put('/editFbo/:id', authMiddleware, editFbo); //Router for editing FBO data
router.get('/fbogeneraldata', fboFormData); //Router for general FBO form data
router.post('/fbo/recipientDetails/:id', eBillUpload.single('eBill'), addRecipient); //Router for adding shop or recipientdata

module.exports = router;