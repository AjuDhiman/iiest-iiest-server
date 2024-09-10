const express = require('express');
const { fboRegister, deleteFbo, editFbo, fboPayment, fboPayReturn, registerdFBOList, saleInvoice, registerdBOList, boByCheque, updateFboBasicDocStatus, approveChequeOrPaylaterSale, getSalesBasicDocUploadURL, sendFboVerificationLink, verifyFbo, updateFboInfo, boPayLater, getChequeImagePresignedUrl } = require('../controllers/fboControllers/fbo');
const { fboFormData, getProductData } = require('../controllers/generalControllers/generalData');
const { addRecipient, addShop, recipientsList, shopsList, addShopByExcel } = require('../controllers/fboControllers/recipient');
const { existingFboCash, existingFboPayReturn, existingFboPayPage, existingFboByCheque, existingFboPayLater } = require('../controllers/fboControllers/existingFbo');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const { foscosDocuments, hraDocuments, chequeImage } = require('../config/storage');
const { createBusinessOwner, getAllBusinessOwners, getClientList } = require('../controllers/boControllers/bo');
const { getTicketsDocs } = require('../controllers/employeeControllers/employeeRecord');
const { fostacRecpVerification } = require('../controllers/operationControllers/formSections');
const { trainingBatch } = require('../controllers/trainingControllers/trainingBatch');
const { uploadCheque } = require('../config/s3Bucket');

const eBillStorage = multer.memoryStorage() 
const eBillUpload = multer({storage: eBillStorage});

const router = express.Router();

router.get('/salerecipients/:id', authMiddleware, recipientsList); //Router for recipients list for sale
router.get('/saleshops/:id', authMiddleware, shopsList); //Router for shops list for sale
router.get('/allfbolist', authMiddleware, registerdFBOList); //Router for fbo list
router.get('/clientlist', authMiddleware, getClientList); //Router for client list
router.post('/fboregister/:id', authMiddleware, fboRegister); //Router for FBO registration (cash)
router.post('/fbopaylater/:id', authMiddleware, boPayLater); //Router for FBO registration (Pay Later)
router.post('/fbobycheque/:id', authMiddleware, uploadCheque.fields([{name: 'cheque_image', maxCount: 1}]), existingFboByCheque);
router.post('/bobycheque/:id', authMiddleware, uploadCheque.fields([{name: 'cheque_image', maxCount: 1}]), boByCheque);
router.post('/fbo-pay-return/:id', fboPayReturn); //To check payment status
router.post('/fbopayment/:id', authMiddleware, fboPayment); //Router for FBO registration (pay page)
router.delete('/deleteFbo/:id', authMiddleware, deleteFbo); //Router for deleting FBO
router.put('/editFbo/:id', authMiddleware, editFbo); //Router for editing FBO data
router.get('/fbogeneraldata', authMiddleware, fboFormData); //Router for general FBO form data
router.get('/getproductdata', authMiddleware, getProductData); //Router for product data
// router.post('/fbo/addshop/:id', authMiddleware, foscosDocuments.fields([{ name: 'eBill', maxCount: 1 }, { name: 'ownerPhoto', maxCount: 1 }, { name: 'shopPhoto', maxCount: 1}, { name: 'aadharPhoto', maxCount: 5 }]), addShop); //Router for adding shop data
router.post('/fbo/addshop/:id', authMiddleware, foscosDocuments.fields([{ name: 'ownerPhoto', maxCount: 1 }, { name: 'shopPhoto', maxCount: 1}, { name: 'aadharPhoto', maxCount: 5 }]), addShop); //Router for adding shop data
router.post('/fbo/addshopbyexcel/:id', authMiddleware, addShopByExcel); 
router.post('/fbo/addrecipient/:id', authMiddleware, addRecipient, fostacRecpVerification, trainingBatch ); //Router for adding recipient data
router.get('/getsalesbasicdocuploadurl/:name', authMiddleware, getSalesBasicDocUploadURL); //route for getting upload url for uploading basic sales docs to AWS S3
// router.post('/fbo/addhygieneshop/:id', authMiddleware, hraDocuments.fields([{ name: 'fostacCertificate', maxCount: 1 }, { name: 'foscosLicense', maxCount: 1 }]), addHygieneShop); //Router for adding hygiene shop data
router.get('/fbo/invoice/:id', authMiddleware, saleInvoice);
router.post('/existingfbosale/:id', authMiddleware, existingFboCash);
router.post('/existingfbo-paypage/:id', authMiddleware, existingFboPayPage)
router.post('/existingfbo-paylater/:id', authMiddleware, existingFboPayLater)
router.post('/existingfbo-pay-return/:id', existingFboPayReturn);
router.post('/approvechequeorpaylatersale/:id', authMiddleware, approveChequeOrPaylaterSale);//this api will approve cheque and send invoice for this sale after approving
router.get('/getclientlist', authMiddleware, getClientList)
router.post('/boregister', createBusinessOwner );
router.get('/getbodata', authMiddleware, getAllBusinessOwners);
router.get('/allbolist', authMiddleware, registerdBOList); 
router.put('/updatefbobasicdocstatus/:id', authMiddleware, updateFboBasicDocStatus); 
router.get('/getticketdocs/:id', authMiddleware, getTicketsDocs); 
router.get('/getchequepresignedurl/:id', authMiddleware, getChequeImagePresignedUrl); 


router.put('/sendfboverificationlink/:fboid', authMiddleware, sendFboVerificationLink); //roure for sending verification link by mail and sms
router.put('/verifyfbo/:fboid', verifyFbo); //route for updating verification info of a fbo
router.put('/updatefboinfo/:id', authMiddleware, updateFboInfo); //route for updating fbo info

module.exports = router;