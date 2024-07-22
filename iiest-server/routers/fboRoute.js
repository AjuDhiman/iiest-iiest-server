const express = require('express');
const { fboRegister, deleteFbo, editFbo, fboPayment, fboPayReturn, registerdFBOList, saleInvoice, registerdBOList, boByCheque, updateFboBasicDocStatus, approveChequeSale } = require('../controllers/fboControllers/fbo');
const { fboFormData, getProductData } = require('../controllers/generalControllers/generalData');
const { addRecipient, addShop, recipientsList, shopsList, showBill, addShopByExcel, uploadEbill, uploadOwnerPhoto, uploadShopPhoto, hygieneShopsList, uploadAadharPhoto } = require('../controllers/fboControllers/recipient');
const { existingFboCash, existingFboPayReturn, existingFboPayPage, existingFboByCheque } = require('../controllers/fboControllers/existingFbo');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const { foscosDocuments, hraDocuments, chequeImage } = require('../config/storage');
const { createBusinessOwner, getAllBusinessOwners, getClientList } = require('../controllers/boControllers/bo');
const { getTicketsDocs } = require('../controllers/employeeControllers/employeeRecord');
const { fostacVerification } = require('../controllers/operationControllers/formSections');
const { trainingBatch } = require('../controllers/trainingControllers/trainingBatch');

const eBillStorage = multer.memoryStorage() 
const eBillUpload = multer({storage: eBillStorage});

const router = express.Router();

router.get('/salerecipients/:id', authMiddleware, recipientsList); //Router for recipients list for sale
router.get('/saleshops/:id', authMiddleware, shopsList); //Router for shops list for sale
router.get('/hygienesaleshops/:id', authMiddleware, hygieneShopsList); //Router for shops list for hygiene sale
router.get('/allfbolist', authMiddleware, registerdFBOList); //Router for fbo list
router.get('/clientlist', getClientList); //Router for client list
router.post('/fboregister/:id', authMiddleware, fboRegister); //Router for FBO registration (cash)
router.post('/fbobycheque/:id', authMiddleware, chequeImage.fields([{name: 'cheque_image', maxCount: 1}]), existingFboByCheque);
router.post('/bobycheque/:id', authMiddleware, chequeImage.fields([{name: 'cheque_image', maxCount: 1}]), boByCheque);
router.post('/fbo-pay-return/:id', fboPayReturn); //To check payment status
router.post('/fbopayment/:id', authMiddleware, fboPayment); //Router for FBO registration (pay page)
router.delete('/deleteFbo/:id', authMiddleware, deleteFbo); //Router for deleting FBO
router.put('/editFbo/:id', authMiddleware, editFbo); //Router for editing FBO data
router.get('/fbogeneraldata', authMiddleware, fboFormData); //Router for general FBO form data
router.get('/getproductdata', authMiddleware, getProductData); //Router for product data
// router.post('/fbo/addshop/:id', authMiddleware, foscosDocuments.fields([{ name: 'eBill', maxCount: 1 }, { name: 'ownerPhoto', maxCount: 1 }, { name: 'shopPhoto', maxCount: 1}, { name: 'aadharPhoto', maxCount: 5 }]), addShop); //Router for adding shop data
router.post('/fbo/addshop/:id', authMiddleware, foscosDocuments.fields([{ name: 'ownerPhoto', maxCount: 1 }, { name: 'shopPhoto', maxCount: 1}, { name: 'aadharPhoto', maxCount: 5 }]), addShop); //Router for adding shop data
router.post('/fbo/addshopbyexcel/:id', authMiddleware, addShopByExcel); 
router.put('/fbo/uploadebill/:id', authMiddleware, foscosDocuments.fields([{name: 'eBill', maxCount: 1}]), uploadEbill); //Router for adding e bill to shop model
router.put('/fbo/uploadownerphoto/:id', authMiddleware, foscosDocuments.fields([{name: 'ownerPhoto', maxCount: 1}]), uploadOwnerPhoto); //Router for adding owner photo to shop model
router.put('/fbo/uploadshophoto/:id', authMiddleware, foscosDocuments.fields([{name: 'shopPhoto', maxCount: 1}]), uploadShopPhoto); //Router for adding shop photo to shop model
router.put('/fbo/uploadaadharphoto/:id', authMiddleware, foscosDocuments.fields([{name: 'aadharPhoto', maxCount: 5}]), uploadAadharPhoto); //Router for adding Aadhar photo to shop model
router.post('/fbo/addrecipient/:id', authMiddleware, addRecipient, fostacVerification, trainingBatch ); //Router for adding recipient data
// router.post('/fbo/addhygieneshop/:id', authMiddleware, hraDocuments.fields([{ name: 'fostacCertificate', maxCount: 1 }, { name: 'foscosLicense', maxCount: 1 }]), addHygieneShop); //Router for adding hygiene shop data
router.get('/shop/ebill/:id', authMiddleware, showBill);
router.get('/fbo/invoice/:id', authMiddleware, saleInvoice);
router.post('/existingfbosale/:id', authMiddleware, existingFboCash);
router.post('/existingfbo-paypage/:id', authMiddleware, existingFboPayPage)
router.post('/existingfbo-pay-return/:id', existingFboPayReturn);
router.post('/approvechequesale/:id', authMiddleware, approveChequeSale);//this api will approve cheque and send invoice for this sale after approving
router.get('/getclientlist', getClientList)
router.post('/boregister', createBusinessOwner );
router.get('/getbodata', authMiddleware, getAllBusinessOwners);
router.get('/allbolist', authMiddleware, registerdBOList); 
router.put('/updatefbobasicdocstatus/:id', authMiddleware, updateFboBasicDocStatus); 
router.get('/getticketdocs/:id', authMiddleware, getTicketsDocs); 

module.exports = router;